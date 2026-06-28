import "../src/config/env.config.js";
import app from "./app.js";
import logger from "./config/logger.config.js";

import { HOST, PORT, NODE_ENV } from "./util/env.util.js";

const startServer = async() => {
    try {
        await app.listen({
            host: HOST,
            port: PORT,
        })
        logger.info(`Server started in ${NODE_ENV} mode`);
        logger.info(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
    } catch(e) {
        logger.error(`Error starting server: ${e.message}`);
        process.exit(1);
    }
}

startServer();