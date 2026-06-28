import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './env.util.js';

export const generateJWTToken = ({
    userID, 
    email, 
    role
}) => {
    const payload = {
        userID: userID,
        email: email,
        role: role,
    };
    const options = {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

export const decodeToken = (token) => {
    return jwt.decode(token);
};
