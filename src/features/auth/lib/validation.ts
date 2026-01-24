import { z } from 'zod';

// Схема валидации для логина
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

// Схема валидации для регистрации
export const registerSchema = z
    .object({
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Invalid email format'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase letter')
            .regex(/[a-z]/, 'Password must contain lowercase letter')
            .regex(/[0-9]/, 'Password must contain number'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Схема валидации для восстановления пароля
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
});

// Схема валидации для сброса пароля
export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase letter')
            .regex(/[a-z]/, 'Password must contain lowercase letter')
            .regex(/[0-9]/, 'Password must contain number'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Схема валидации для смены пароля
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(1, 'New password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase letter')
            .regex(/[a-z]/, 'Password must contain lowercase letter')
            .regex(/[0-9]/, 'Password must contain number'),
        confirmNewPassword: z
            .string()
            .min(1, 'Confirm new password is required'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
    });

// Типы форм
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
