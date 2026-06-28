import { verifyToken } from "../util/jwt.util.js";
import { responseError } from "../util/response.util.js";
import logger from "../config/logger.config.js";
import { getRedisClient } from "../config/redis.config.js";

const validateToken = async(req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        logger.warn("No token provided in cookies");
        return responseError(res, 401, "Access token is required", "error", "UNAUTHORIZED");
    }

    const redisClient = await getRedisClient();
    const blacklistKey = `blacklistToken:${token}`;
    const isBlacklisted = await redisClient.get(blacklistKey);

    if (isBlacklisted === "blacklisted") {
        logger.warn("Blacklisted token attempt detected");
        return responseError(res, 401, "Token has been revoked", "error", "TOKEN_REVOKED");
    }

    try {
        const decoded = verifyToken(token);

        req.user = {
            userID: decoded.userID,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        
        if (error.message === 'jwt expired' || error.name === 'TokenExpiredError') {
            return responseError(res, 401, "Token has expired", "error", "TOKEN_EXPIRED");
        }
        
        return responseError(res, 403, "Invalid token", "error", "INVALID_TOKEN");
    }
};

export default validateToken;