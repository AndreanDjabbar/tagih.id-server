import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from '../config/logger.config.js';
import { CLIENT_URL, EMAIL, EMAIL_PASSWORD } from './env.util.js';

export const generateOTPNumber = (len = 6) => {
    const characters = '12345678';
    let result = '';
    for (let i = 0; i < len; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

export const generateRandomToken = (len) => {
    return crypto.randomBytes(len).toString("hex");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    },
});

export const sendVerificationEmail = (email, token, otpCode) => {
    const verificationLink = `${CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = "DineHub Email Verification";
    const body = `
        <html>
        <body>
            <p>Your OTP Code is: <strong>${otpCode}</strong></p>
            <p>Valid for 5 minutes. If you did not request this, ignore this email.</p>
            <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
        </body>
        </html>
    `;
    const mailOptions = {
        from: `"DineHub" <${EMAIL}>`,
        to: email,
        subject: subject,
        text: `Your OTP Code is: ${otpCode}\n\nClick the link to verify your email: ${verificationLink}`,
        html: body,
    };
    
    transporter.sendMail(mailOptions)
        .then(() => logger.info(`Verification email sent to ${email}`))
        .catch((error) => logger.error(`Failed to send email to ${email}: ${error.message}`));
}

export const sendResetPasswordEmail = (email, token) => {
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = "DineHub Password Reset";
    const body = `
        <html>
        <body>
            <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        </body>
        </html>
    `
    const mailOptions = {
        from: `"DineHub" <${EMAIL}>`,
        to: email,
        subject: subject,
        text: `Click the link to reset your password: ${resetLink}`,
        html: body,
    };
    
    transporter.sendMail(mailOptions)
        .then(() => logger.info(`Password reset email sent to ${email}`))
        .catch((error) => logger.error(`Failed to send email to ${email}: ${error.message}`));
}