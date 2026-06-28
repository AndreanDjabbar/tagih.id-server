import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi
    .string()
    .min(3)
    .required()
    .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name should have a minimum length of {#limit}',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required()
    .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required()
    .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
        'string.base': 'Confirm Password must be a string',
        'string.empty': 'Confirm Password is required',
        'any.only': 'Confirm Password does not match',
        'any.required': 'Confirm Password is required',
    }),
}) 

export const loginSchema = Joi.object({
    email: Joi.string().email().required()
    .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required()
    .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'string.min': 'Password should have a minimum length of {#limit}',
        'any.required': 'Password is required',
    }),
})

export const registerOTPCodeSchema = Joi.object({
    otpCode: Joi.string().length(6).required()
    .messages({
        'string.base': 'OTP Code must be a string',
        'string.empty': 'OTP Code is required',
        'string.length': 'OTP Code must be exactly {#limit} characters',
        'any.required': 'OTP Code is required',
    }),
})

export const forgotPasswordEmailSchema = Joi.object({
    email: Joi.string().email().required()
    .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
})

export const forgotPasswordResetSchema = Joi.object({
    newPassword: Joi.string().min(6).required()
    .messages({
        'string.base': 'New Password must be a string',
        'string.empty': 'New Password is required',
        'string.min': 'New Password should have a minimum length of {#limit}',
        'any.required': 'New Password is required',
    }),
})