import 'dotenv/config';
import app from './app.js';
import { serverConfig, appConfig, configureServer, setupGracefulShutdown} from '#config/index.js';

const server = app.listen(serverConfig.port, serverConfig.host, () => {
    console.log(`${appConfig.name} running at http://${serverConfig.host}:${serverConfig.port}`);
});

configureServer(server);
setupGracefulShutdown(server);

export default server;