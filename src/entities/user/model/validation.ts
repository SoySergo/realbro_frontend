import { z } from 'zod';

/**
 * Схема валидации настроек пользователя
 */
export const userSettingsSchema = z.object({
    language: z.string().min(2).max(5).optional(),
    notifications_email: z.boolean().optional(),
    notifications_push: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    display_name: z.string().min(1).max(50).optional(),
});

/**
 * Схема валидации запроса на обновление пользователя
 */
export const updateUserRequestSchema = z.object({
    email: z.string().email().optional(),
    settings: userSettingsSchema.partial().optional(),
});

/**
 * Схема валидации запроса на регистрацию
 */
export const registerRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

/**
 * Схема валидации запроса на логин
 */
export const loginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

/**
 * Схема валидации запроса на смену пароля
 */
export const changePasswordRequestSchema = z.object({
    old_password: z.string().min(1),
    new_password: z.string().min(8).max(100),
});

/**
 * Схема валидации запроса на сброс пароля
 */
export const passwordResetRequestSchema = z.object({
    email: z.string().email(),
});

/**
 * Схема валидации запроса на установку нового пароля
 */
export const resetPasswordRequestSchema = z.object({
    token: z.string().min(1),
    new_password: z.string().min(8).max(100),
});

/**
 * Схема валидации настроек уведомлений
 */
export const notificationSettingsSchema = z.object({
    email: z.object({
        newProperties: z.boolean(),
        priceChanges: z.boolean(),
        savedSearches: z.boolean(),
        promotions: z.boolean(),
        accountUpdates: z.boolean(),
    }).optional(),
    push: z.object({
        newProperties: z.boolean(),
        priceChanges: z.boolean(),
        savedSearches: z.boolean(),
        messages: z.boolean(),
    }).optional(),
    telegram: z.object({
        enabled: z.boolean(),
        chatId: z.string().optional(),
        newProperties: z.boolean(),
        priceChanges: z.boolean(),
    }).optional(),
});

/**
 * Схема валидации запроса на обновление настроек уведомлений
 */
export const updateNotificationSettingsRequestSchema = notificationSettingsSchema.partial();

/**
 * Схема валидации запроса на обновление подписки
 */
export const updateSubscriptionRequestSchema = z.object({
    planId: z.enum(['free', 'trial', 'standard', 'maximum']),
    paymentMethodId: z.string().optional(),
});

/**
 * Схема валидации запроса на отмену подписки
 */
export const cancelSubscriptionRequestSchema = z.object({
    reason: z.string().max(500).optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
});
