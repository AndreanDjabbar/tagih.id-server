import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.config.js';
import { GLOBAL_RATE_LIMITER_REQ, GLOBAL_RATE_LIMITER_TIME } from '../util/env.util.js';
import { responseError } from '../util/response.util.js';

const globalLimiter = rateLimit({
    windowMs: GLOBAL_RATE_LIMITER_TIME*60*1000,
    max: GLOBAL_RATE_LIMITER_REQ,
    standardHeaders: true, 
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: async (...args) => {
            const client = await getRedisClient();
            return client.call(...args);
        },
        prefix: 'limit:global:',
    }),
    handler: (req, res) => {
        return responseError(
            res, 
            429,
            'You have reached your request limit. Please try again later.', 
            'rateLimitInfo',
        );
    },
});

const userLimiter = (minuteTime, requestAmount, prefix = 'user') => {
    return rateLimit({
        windowMs: Number(minuteTime) * 60 * 1000,
        max: requestAmount,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return req.user?.id || ipKeyGenerator(req);
        },
        store: new RedisStore({
            sendCommand: async (...args) => {
                const client = await getRedisClient();
                return client.call(...args);
            },
            prefix: `limit:${prefix}:`,
        }),
        handler: (req, res, next, options) => {
            const error = new Error('You have reached your request limit. Please try again later.');
            
            error.statusCode = 429;
            error.data = {
                retryAfter: res.getHeader('Retry-After')
            }
            throw error; 
        },
    });
};

const rateLimiter = (type='global', options={}) => {
    if (type !== 'global' && (!options || !options.minuteTime || !options.requestAmount || !options.prefix)) {
        throw new Error('For non-global limiters, options with minuteTime, requestAmount, and prefix are required.');
    }

    if (type === 'global') {
        return globalLimiter;
    } else {
        return userLimiter(options.minuteTime, options.requestAmount, options.prefix);
    }
}

export default rateLimiter;