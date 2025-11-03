#!/bin/bash
# Studion Frontend Structure Setup Script

echo "🏗️  Creating Studion Frontend Structure..."

# Navigate to src directory
cd src

# Create all directories
mkdir -p components/{ui,layout,auth,documents,quizzes/QuestionTypes,courses,subscription,analytics,points}
mkdir -p pages/{auth,dashboard,documents,quizzes,courses,subscription,profile}
mkdir -p hooks services store/slices utils assets/{images,icons,fonts}

echo "✅ Folders created successfully!"

# Create index files for each component directory
touch components/ui/index.js
touch components/layout/index.js
touch components/auth/index.js
touch components/documents/index.js
touch components/quizzes/index.js
touch components/courses/index.js
touch components/subscription/index.js
touch components/analytics/index.js
touch components/points/index.js

echo "✅ Index files created!"
echo "🚀 Structure setup complete!"