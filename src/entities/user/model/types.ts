/**
 * Ответ API при аутентификации
 */
export type AuthResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: UserInfo;
};

/**
 * Базовая информация о пользователе (из /auth/me)
 */
export type UserInfo = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
};

/**
 * Полная информация о пользователе (из /users/me)
 */
export type UserResponse = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    settings: UserSettings;
    created_at: string;
    updated_at: string;
};

/**
 * Настройки пользователя
 */
export type UserSettings = {
    language?: string;
    notifications_email?: boolean;
    notifications_push?: boolean;
    theme?: 'light' | 'dark' | 'system';
    display_name?: string;
};

/**
 * Роли пользователей
 */
export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * Запрос на обновление пользователя
 */
export type UpdateUserRequest = {
    email?: string;
    settings?: Partial<UserSettings>;
};

/**
 * Запрос на регистрацию
 */
export type RegisterRequest = {
    email: string;
    password: string;
};

/**
 * Запрос на логин
 */
export type LoginRequest = {
    email: string;
    password: string;
};

/**
 * Запрос на смену пароля
 */
export type ChangePasswordRequest = {
    old_password: string;
    new_password: string;
};

/**
 * Запрос на сброс пароля (отправка email)
 */
export type PasswordResetRequest = {
    email: string;
};

/**
 * Запрос на установку нового пароля
 */
export type ResetPasswordRequest = {
    token: string;
    new_password: string;
};

/**
 * Ответ с количеством активных сессий
 */
export type SessionsResponse = {
    active_sessions: number;
};

/**
 * Общий ответ с сообщением
 */
export type MessageResponse = {
    message: string;
};

/**
 * Ответ с URL для Google OAuth
 */
export type GoogleOAuthURLResponse = {
    url: string;
};

// ============================================================================
// Subscription & Billing Types
// ============================================================================

/**
 * Типы тарифных планов
 */
export type SubscriptionPlanId = 'free' | 'trial' | 'standard' | 'maximum';

/**
 * Статус подписки
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

/**
 * Период подписки
 */
export type BillingPeriod = 'monthly' | 'yearly';

/**
 * Тарифный план
 */
export type SubscriptionPlan = {
    id: SubscriptionPlanId;
    name: string;
    price: number;
    currency: string;
    period: BillingPeriod;
    features: {
        searchTabs: number;
        aiFilters: number;
        ownerAccess: boolean;
        ownerAccessMultiplier?: number;
        durationDays: number;
    };
};

/**
 * Текущая подписка пользователя
 */
export type UserSubscription = {
    id: string;
    planId: SubscriptionPlanId;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
};

/**
 * Метод оплаты
 */
export type PaymentMethodType = 'card' | 'paypal' | 'bank_transfer';

/**
 * Платежный метод
 */
export type PaymentMethod = {
    id: string;
    type: PaymentMethodType;
    isDefault: boolean;
    card?: {
        brand: string;
        last4: string;
        expiryMonth: number;
        expiryYear: number;
    };
    paypal?: {
        email: string;
    };
    createdAt: string;
};

/**
 * Статус платежа
 */
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

/**
 * История платежа
 */
export type PaymentHistory = {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    description: string;
    planId?: SubscriptionPlanId;
    paymentMethodId?: string;
    invoiceUrl?: string;
    createdAt: string;
};

// ============================================================================
// Notification Settings Types
// ============================================================================

/**
 * Настройки уведомлений
 */
export type NotificationSettings = {
    // Email уведомления
    email: {
        newProperties: boolean;
        priceChanges: boolean;
        savedSearches: boolean;
        promotions: boolean;
        accountUpdates: boolean;
    };
    // Push уведомления
    push: {
        newProperties: boolean;
        priceChanges: boolean;
        savedSearches: boolean;
        messages: boolean;
    };
    // Telegram бот
    telegram: {
        enabled: boolean;
        chatId?: string;
        newProperties: boolean;
        priceChanges: boolean;
    };
};

// ============================================================================
// Extended User Profile Types
// ============================================================================

/**
 * Расширенные настройки пользователя
 */
export type ExtendedUserSettings = UserSettings & {
    notifications: NotificationSettings;
    currency?: string;
    timezone?: string;
};

/**
 * Расширенный профиль пользователя (для страницы профиля)
 */
export type ExtendedUserProfile = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    settings: ExtendedUserSettings;
    subscription?: UserSubscription;
    paymentMethods: PaymentMethod[];
    created_at: string;
    updated_at: string;
    // Статистика
    stats?: {
        savedProperties: number;
        savedSearches: number;
        viewedProperties: number;
    };
};

/**
 * Данные для страницы профиля
 */
export type ProfilePageData = {
    profile: ExtendedUserProfile;
    subscription: UserSubscription | null;
    plans: SubscriptionPlan[];
    paymentHistory: PaymentHistory[];
    paymentMethods: PaymentMethod[];
    activeSessions: number;
};

/**
 * Запрос на обновление уведомлений
 */
export type UpdateNotificationSettingsRequest = Partial<NotificationSettings>;

/**
 * Запрос на обновление подписки
 */
export type UpdateSubscriptionRequest = {
    planId: SubscriptionPlanId;
    paymentMethodId?: string;
};

/**
 * Запрос на отмену подписки
 */
export type CancelSubscriptionRequest = {
    reason?: string;
    cancelAtPeriodEnd?: boolean;
};

/**
 * Активная сессия пользователя
 */
export type UserSession = {
    id: string;
    device: string;
    browser: string;
    location?: string;
    ip?: string;
    lastActive: string;
    isCurrent: boolean;
    createdAt: string;
};
