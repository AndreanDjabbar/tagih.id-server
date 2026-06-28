import logger from "./logger.config.js";
import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../util/env.util.js";

let redisClient;
let isConnecting = false;

const connectToRedis = async() => {
    if (isConnecting) {
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return redisClient;
    }

    try {
        isConnecting = true;
        
        redisClient = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            lazyConnect: true,
            connectTimeout: 10000,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        redisClient.on("connect", () => {
            logger.info("Redis connected on PORT: " + REDIS_PORT);
        });

        redisClient.on("error", (err) => {
            logger.error(`Redis connection error: ${err.message}`);
        });

        redisClient.on("close", () => {
            logger.warn("Redis connection closed");
        });

        await redisClient.connect();
        isConnecting = false;
        return redisClient;
    } catch(e) {
        isConnecting = false;
        logger.error(`Redis connection error: ${e.message}`);
        throw e;
    }
};

await connectToRedis().catch(err => {
    logger.error("Failed to initialize Redis connection");
    process.exit(1);
});

export const getRedisClient = async() => {
    if (redisClient && (redisClient.status === "ready" || redisClient.status === "connect")) {
        return redisClient;
    }

    logger.warn("Redis client not ready (status: " + (redisClient?.status || "none") + "), reconnecting...");
    return await connectToRedis();
};