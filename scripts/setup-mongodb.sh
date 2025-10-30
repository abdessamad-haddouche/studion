#!/bin/bash

# ==========================================
# MongoDB Setup Script for Studion Backend
# Enhanced for reliable user creation
# ==========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==========================================
# AUTO-DETECT PROJECT ROOT
# ==========================================

get_project_root() {
    local current_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [[ "$current_dir" == */scripts ]]; then
        PROJECT_ROOT="$(dirname "$current_dir")"
    else
        PROJECT_ROOT="$current_dir"
    fi
    
    if [ ! -d "$PROJECT_ROOT/backend" ]; then
        echo -e "${RED}[ERROR]${NC} Cannot find backend directory. Please run from project root or scripts directory."
        echo "Current script location: $current_dir"
        echo "Looking for backend at: $PROJECT_ROOT/backend"
        exit 1
    fi
    
    echo -e "${GREEN}[INFO]${NC} Project root detected: $PROJECT_ROOT"
}

# ==========================================
# UTILITY FUNCTIONS
# ==========================================

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==========================================
# CREATE ENV TEMPLATE
# ==========================================

create_env_template() {
    print_step "Creating .env template..."
    
    mkdir -p "$PROJECT_ROOT/backend"
    
    ENV_TEMPLATE="$PROJECT_ROOT/backend/.env.example"
    ENV_FILE="$PROJECT_ROOT/backend/.env"
    
    cat > "$ENV_TEMPLATE" << EOF
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
MONGODB_DB_NAME=studion
MONGODB_USER=studion_user
MONGODB_PASSWORD=your_secure_password_here
MONGODB_VERSION=7.0

# Connection URI (auto-generated based on above)
MONGODB_URI=mongodb://localhost:27017/studion

# For production with authentication:
# MONGODB_URI=mongodb://\${MONGODB_USER}:\${MONGODB_PASSWORD}@localhost:27017/\${MONGODB_DB_NAME}

# ==========================================
# JWT SECRETS (Generate new ones for production!)
# ==========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too-$(openssl rand -hex 32)

# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=development
PORT=5000
APP_NAME=Studion
APP_VERSION=1.0.0-dev
API_PREFIX=/api

# ==========================================
# FEATURE FLAGS
# ==========================================
FEATURE_API_DOCS=true
FEATURE_RATE_LIMITING=false
FEATURE_REQUEST_LOGGING=true
EOF
    
    print_success "Created .env.example template at $ENV_TEMPLATE"
    
    if [ ! -f "$ENV_FILE" ]; then
        print_warning ".env file not found. Creating from template..."
        cp "$ENV_TEMPLATE" "$ENV_FILE"
        print_success "Created .env file from template at $ENV_FILE"
        echo ""
        echo -e "${YELLOW}IMPORTANT: Please edit $ENV_FILE and update:${NC}"
        echo "  - MONGODB_PASSWORD (use a strong password)"
        echo "  - JWT_SECRET and JWT_REFRESH_SECRET"
        echo ""
        read -p "Press Enter after updating .env file..." -r
    fi
}

# ==========================================
# LOAD CONFIGURATION FROM .env
# ==========================================

load_env_config() {
    print_step "Loading configuration from .env file..."
    
    ENV_FILE="$PROJECT_ROOT/backend/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        print_error ".env file not found at $ENV_FILE"
        echo ""
        echo "Please ensure $ENV_FILE exists with the following variables:"
        echo "MONGODB_DB_NAME=studion"
        echo "MONGODB_USER=studion_user"
        echo "MONGODB_PASSWORD=your_secure_password"
        echo "MONGODB_VERSION=7.0"
        echo ""
        exit 1
    fi
    
    set -a
    source "$ENV_FILE"
    set +a
    
    DB_NAME=${MONGODB_DB_NAME:-"studion"}
    DB_USER=${MONGODB_USER:-"studion_user"}
    DB_PASSWORD=${MONGODB_PASSWORD:-""}
    MONGODB_VERSION=${MONGODB_VERSION:-"7.0"}
    
    if [ -z "$DB_PASSWORD" ]; then
        print_error "MONGODB_PASSWORD is required in .env file"
        exit 1
    fi
    
    print_success "Configuration loaded from $ENV_FILE:"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: [HIDDEN]"
    echo "  MongoDB Version: $MONGODB_VERSION"
}

# ==========================================
# CHECK IF MONGODB IS INSTALLED
# ==========================================

check_mongodb_installed() {
    print_step "Checking if MongoDB is installed..."
    
    if command -v mongod &> /dev/null; then
        MONGODB_INSTALLED=true
        CURRENT_VERSION=$(mongod --version | head -n1 | grep -oP 'v\K[0-9]+\.[0-9]+' || echo "unknown")
        print_success "MongoDB is installed (version $CURRENT_VERSION)"
        
        # Check if service is running
        if sudo systemctl is-active --quiet mongod; then
            print_success "MongoDB service is already running"
        else
            print_warning "MongoDB is installed but not running"
        fi
        
        return 0
    else
        MONGODB_INSTALLED=false
        print_warning "MongoDB is not installed"
        return 1
    fi
}

# ==========================================
# DETECT UBUNTU VERSION AND SETUP REPO
# ==========================================

setup_mongodb_repository() {
    print_step "Setting up MongoDB repository..."
    
    UBUNTU_CODENAME=$(lsb_release -cs)
    print_step "Detected Ubuntu codename: $UBUNTU_CODENAME"
    
    if [ "$UBUNTU_CODENAME" = "noble" ]; then
        print_warning "Ubuntu 24.04 detected, using Ubuntu 22.04 (jammy) repository"
        REPO_CODENAME="jammy"
    else
        REPO_CODENAME="$UBUNTU_CODENAME"
    fi
    
    print_step "Using repository for: $REPO_CODENAME"
    
    print_step "Adding MongoDB GPG key..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-${MONGODB_VERSION}.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg
    
    print_step "Adding MongoDB repository..."
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu ${REPO_CODENAME}/mongodb-org/${MONGODB_VERSION} multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-${MONGODB_VERSION}.list
}

# ==========================================
# INSTALL MONGODB
# ==========================================

install_mongodb() {
    print_step "Installing MongoDB Community Edition $MONGODB_VERSION..."
    
    sudo apt update
    
    sudo apt install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
    
    setup_mongodb_repository
    
    sudo apt update
    
    print_step "Installing MongoDB packages..."
    sudo apt install -y mongodb-org
    
    print_success "MongoDB installed successfully!"
}

# ==========================================
# CONFIGURE MONGODB SERVICE
# ==========================================

configure_mongodb_service() {
    print_step "Configuring MongoDB service..."
    
    sudo mkdir -p /var/lib/mongodb
    sudo mkdir -p /var/log/mongodb
    
    sudo chown mongodb:mongodb /var/lib/mongodb
    sudo chown mongodb:mongodb /var/log/mongodb
    
    if ! sudo systemctl is-active --quiet mongod; then
        print_step "Starting MongoDB service..."
        sudo systemctl start mongod
    fi
    
    sudo systemctl enable mongod
    
    sleep 3
    
    if sudo systemctl is-active --quiet mongod; then
        print_success "MongoDB service is running"
    else
        print_error "Failed to start MongoDB service"
        sudo systemctl status mongod
        exit 1
    fi
}

# ==========================================
# CHECK IF USER EXISTS
# ==========================================

check_user_exists() {
    print_step "Checking if database user '$DB_USER' exists..."
    
    if command -v mongosh &> /dev/null; then
        MONGO_CLIENT="mongosh"
    elif command -v mongo &> /dev/null; then
        MONGO_CLIENT="mongo"
    else
        print_error "Neither mongosh nor mongo client found"
        exit 1
    fi
    
    # Check if user exists
    USER_EXISTS=$($MONGO_CLIENT --quiet $DB_NAME --eval "
        const users = db.getUsers();
        const userExists = users.some(user => user.user === '$DB_USER');
        print(userExists);
    " 2>/dev/null || echo "false")
    
    if [ "$USER_EXISTS" = "true" ]; then
        print_success "User '$DB_USER' already exists"
        return 0
    else
        print_warning "User '$DB_USER' does not exist"
        return 1
    fi
}

# ==========================================
# CREATE DATABASE AND USER
# ==========================================

setup_database() {
    print_step "Setting up database '$DB_NAME' and user '$DB_USER'..."
    
    if command -v mongosh &> /dev/null; then
        MONGO_CLIENT="mongosh"
    elif command -v mongo &> /dev/null; then
        MONGO_CLIENT="mongo"
    else
        print_error "Neither mongosh nor mongo client found"
        exit 1
    fi
    
    print_step "Using $MONGO_CLIENT client..."
    
    # Create user with detailed error handling
    print_step "Creating database user..."
    CREATE_USER_RESULT=$($MONGO_CLIENT --quiet $DB_NAME --eval "
        try {
            db.createUser({
                user: '$DB_USER',
                pwd: '$DB_PASSWORD',
                roles: [
                    { role: 'readWrite', db: '$DB_NAME' },
                    { role: 'dbAdmin', db: '$DB_NAME' }
                ]
            });
            print('SUCCESS: User $DB_USER created successfully');
        } catch (e) {
            if (e.code === 11000) {
                print('INFO: User $DB_USER already exists');
            } else {
                print('ERROR: ' + e.message);
            }
        }
    " 2>&1)
    
    echo "$CREATE_USER_RESULT"
    
    if [[ "$CREATE_USER_RESULT" == *"SUCCESS"* ]] || [[ "$CREATE_USER_RESULT" == *"INFO"* ]]; then
        print_success "User setup completed"
    else
        print_error "User creation failed: $CREATE_USER_RESULT"
        exit 1
    fi
    
    # Create collections and indexes
    print_step "Creating collections and indexes..."
    COLLECTION_RESULT=$($MONGO_CLIENT --quiet $DB_NAME --eval "
        try {
            // Create users collection with validator
            db.createCollection('users', {
                validator: {
                    \$jsonSchema: {
                        bsonType: 'object',
                        required: ['email', 'password', 'name', 'userType'],
                        properties: {
                            email: { bsonType: 'string' },
                            password: { bsonType: 'string' },
                            userType: { enum: ['student', 'admin'] },
                            status: { enum: ['active', 'inactive', 'suspended', 'deleted'] }
                        }
                    }
                }
            });
            
            // Create indexes
            db.users.createIndex({ email: 1 }, { unique: true });
            db.users.createIndex({ userType: 1, status: 1 });
            db.users.createIndex({ 'verification.isEmailVerified': 1, status: 1 });
            db.users.createIndex({ lastActiveAt: -1 });
            db.users.createIndex({ createdAt: -1 });
            
            print('SUCCESS: Collections and indexes created');
        } catch (e) {
            if (e.code === 48) {
                print('INFO: Collection users already exists');
            } else {
                print('ERROR: ' + e.message);
            }
        }
    " 2>&1)
    
    echo "$COLLECTION_RESULT"
    
    if [[ "$COLLECTION_RESULT" == *"SUCCESS"* ]] || [[ "$COLLECTION_RESULT" == *"INFO"* ]]; then
        print_success "Database setup completed"
    else
        print_error "Database setup failed: $COLLECTION_RESULT"
        exit 1
    fi
}

# ==========================================
# UPDATE ENV FILE WITH CONNECTION URI
# ==========================================

update_env_file() {
    print_step "Updating .env file with connection URI..."
    
    ENV_FILE="$PROJECT_ROOT/backend/.env"
    CONNECTION_URI="mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME"
    
    if grep -q "MONGODB_URI=" "$ENV_FILE"; then
        sed -i "s|MONGODB_URI=.*|MONGODB_URI=$CONNECTION_URI|" "$ENV_FILE"
    else
        echo "MONGODB_URI=$CONNECTION_URI" >> "$ENV_FILE"
    fi
    
    print_success "Updated MONGODB_URI in $ENV_FILE"
}

# ==========================================
# TEST CONNECTION
# ==========================================

test_connection() {
    print_step "Testing MongoDB connection..."
    
    # Test basic connection first
    if command -v mongosh &> /dev/null; then
        BASIC_TEST=$(mongosh --quiet $DB_NAME --eval "db.runCommand({ connectionStatus: 1 })" 2>&1)
    elif command -v mongo &> /dev/null; then
        BASIC_TEST=$(mongo --quiet $DB_NAME --eval "db.runCommand({ connectionStatus: 1 })" 2>&1)
    fi
    
    if [[ "$BASIC_TEST" == *"ok"* ]]; then
        print_success "Basic MongoDB connection working"
    else
        print_error "Basic MongoDB connection failed"
        exit 1
    fi
    
    # Test authenticated connection
    print_step "Testing authenticated connection..."
    if command -v mongosh &> /dev/null; then
        AUTH_TEST=$(mongosh --quiet "mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME" --eval "db.runCommand({ connectionStatus: 1 })" 2>&1)
    elif command -v mongo &> /dev/null; then
        AUTH_TEST=$(mongo --quiet "mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME" --eval "db.runCommand({ connectionStatus: 1 })" 2>&1)
    fi
    
    if [[ "$AUTH_TEST" == *"ok"* ]]; then
        print_success "Authenticated MongoDB connection test passed!"
    else
        print_error "Authenticated MongoDB connection test failed: $AUTH_TEST"
        exit 1
    fi
}

# ==========================================
# DISPLAY INFORMATION
# ==========================================

display_info() {
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}         MONGODB SETUP COMPLETE        ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${BLUE}Project Root:${NC} $PROJECT_ROOT"
    echo -e "${BLUE}Environment File:${NC} $PROJECT_ROOT/backend/.env"
    echo ""
    echo -e "${BLUE}Database Information:${NC}"
    echo "  Database Name: $DB_NAME"
    echo "  Database User: $DB_USER"
    echo "  Connection URI: mongodb://$DB_USER:****@localhost:27017/$DB_NAME"
    echo ""
    echo -e "${BLUE}Service Management:${NC}"
    echo "  Start:   sudo systemctl start mongod"
    echo "  Stop:    sudo systemctl stop mongod"
    echo "  Restart: sudo systemctl restart mongod"
    echo "  Status:  sudo systemctl status mongod"
    echo ""
    echo -e "${BLUE}Connect to Database:${NC}"
    echo "  mongosh mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME"
    echo ""
    echo -e "${BLUE}Test Connection:${NC}"
    echo "  mongosh mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME --eval \"db.runCommand({ connectionStatus: 1 })\""
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Your .env file is configured and ready"
    echo "  2. cd $PROJECT_ROOT/backend && npm run dev"
    echo "  3. Test your BaseUser model"
    echo ""
}

# ==========================================
# MAIN EXECUTION
# ==========================================

main() {
    echo -e "${GREEN}Starting MongoDB setup for Studion...${NC}"
    echo ""
    
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root"
        exit 1
    fi
    
    get_project_root
    
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        create_env_template
    fi
    
    load_env_config
    
    if check_mongodb_installed; then
        print_success "MongoDB is already installed, configuring service..."
        configure_mongodb_service
    else
        install_mongodb
        configure_mongodb_service
    fi
    
    setup_database
    
    update_env_file
    
    test_connection
    
    display_info
    
    print_success "MongoDB setup completed successfully!"
}

trap 'print_error "Script failed on line $LINENO"' ERR

main "$@"