import bcrypt from "bcrypt";
import { generateOTPNumber, generateRandomToken, sendResetPasswordEmail, sendVerificationEmail } from "../util/main.util.js";
import { getRedisClient } from "../config/redis.config.js";
import { generateJWTToken, verifyToken } from "../util/jwt.util.js";
import UserRepository from "../repository/user.repository.js";

class AuthService {
    static async login(email, password) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        if (!user.is_verified) {
            const error = new Error("User email not verified");
            error.statusCode = 403;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!password || !isPasswordValid) {
            const error = new Error("Invalid email or password");
            error.statusCode = 400;
            throw error;
        } 

        if (!user.is_verified) {
            const otpCode = generateOTPNumber();
            const emailVerificationToken = generateRandomToken(100);
            const redisKey = `emailVerification:${user.id}`;

            const redisClient = await getRedisClient();
            await redisClient.del(redisKey);
            await redisClient.hset(redisKey, {
                otpCode,
                emailVerificationToken
            });
            await redisClient.expire(redisKey, 5 * 60);
            sendVerificationEmail(email, emailVerificationToken, otpCode);

            const error = new Error("Email not verified. Please check your email for OTP verification.");
            error.statusCode = 403;
            error.data = {
                token: emailVerificationToken
            }
            throw error;
        }

        const tokenJWT = generateJWTToken({
            userID: user.id,
            email: user.email,
            role: user.role
        });

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurant_id
            },
            token: tokenJWT,
        };
    }

    static async register(name, email, password) {
        const existingUser = await UserRepository.getByEmail(email);
        if (existingUser) {
            const error = new Error("Email already in use");
            error.statusCode = 409;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.create({
            name,
            email,
            password: hashedPassword,
            role: "USER",
            restaurant_id: restaurantId
        });
        const otpCode = generateOTPNumber();
        const emailVerificationToken = generateRandomToken(100);
        const redisKey = `emailVerification:${newUser.id}`;

        const redisClient = await getRedisClient();
        await redisClient.del(redisKey);
        await redisClient.hset(redisKey, {
            otpCode,
            emailVerificationToken
        });
        await redisClient.expire(redisKey, 5 * 60);

        sendVerificationEmail(email, emailVerificationToken, otpCode);
        return {
            user: newUser,
            token: emailVerificationToken
        };
    }

    static async verifyRegisterToken(token, email) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const redisKey = `emailVerification:${user.id}`;
        const redisClient = await getRedisClient();
        const storedToken = await redisClient.hget(redisKey, "emailVerificationToken");
        if (token !== storedToken) {
            const error = new Error("Invalid or expired token");
            error.statusCode = 400;
            throw error;
        }
        return user;
    }

    static async verifyRegisterOtp(token, email, otpCode) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        const redisKey = `emailVerification:${user.id}`;
        const redisClient = await getRedisClient();
        const cachedData = await redisClient.hgetall(redisKey);

        if(!cachedData || Object.keys(cachedData).length === 0) {
            const error = new Error("OTP has expired or is invalid");
            error.statusCode = 400;
            throw error;
        }

        if(cachedData.otpCode !== otpCode) {
            const error = new Error("Invalid OTP code");
            error.statusCode = 400;
            throw error;
        }

        if (token !== cachedData.emailVerificationToken) {
            const error = new Error("Invalid or expired token");
            error.statusCode = 400;
            throw error;
        }

        await UserRepository.updateUser(user.id, { is_verified: true });
        await redisClient.del(redisKey);
        return user;
    }

    static async forgotPasswordEmailVerification(email) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const redisClient = await getRedisClient();
        const resetToken = generateRandomToken(100);
        const redisKey = `forgotPassword:${user.id}`;
        await redisClient.hset(redisKey, {
            resetToken
        });
        await redisClient.expire(redisKey, 15 * 60);

        sendResetPasswordEmail(email, resetToken);
    }

    static async forgotPasswordLinkVerification(token, email) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const redisKey = `forgotPassword:${user.id}`;
        const redisClient = await getRedisClient();
        const storedToken = await redisClient.hget(redisKey, "resetToken");
        if (token !== storedToken) {
            const error = new Error("Invalid or expired token");
            error.statusCode = 400;
            throw error;
        }
    }

    static async forgotPasswordReset(token, email, newPassword) {
        const user = await UserRepository.getByEmail(email);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        if (!user.is_verified) {
            const error = new Error("User email not verified");
            error.statusCode = 403;
            throw error;
        }

        const redisKey = `forgotPassword:${user.id}`;
        const redisClient = await getRedisClient();
        const storedToken = await redisClient.hget(redisKey, "resetToken");
        if (token !== storedToken) {
            const error = new Error("Invalid or expired token");
            error.statusCode = 400;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserRepository.updateUser(user.id, { password: hashedPassword });
        await redisClient.del(redisKey);
    }

    static async logout(token) {
        if (!token) {
            const error = new Error("Token is required");
            error.statusCode = 400;
            throw error;
        }
        const redisClient = await getRedisClient();
        const blacklistKey = `blacklistToken:${token}`;
        await redisClient.set(blacklistKey, "blacklisted");
        const decoded = verifyToken(token);
        const expiresAt = new Date(decoded.exp * 1000);
        const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        await redisClient.expire(blacklistKey, ttl);
    }
}

export default AuthService;