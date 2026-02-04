'use client';

import { FEATURES } from '@/shared/config/features';

// ============================================================================
// Типы для контактов
// ============================================================================

/**
 * Тип автора объявления
 */
export type AuthorType = 'owner' | 'agent' | 'agency';

/**
 * Контактная информация
 */
export interface ContactInfo {
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    email?: string;
    website?: string;
    agencyProfile?: string;
}

/**
 * Ошибка доступа к контактам
 */
export type ContactAccessError =
    | 'auth_required'      // Требуется авторизация
    | 'limit_exceeded'     // Превышен лимит
    | 'subscription_required'; // Требуется подписка

/**
 * Ответ на запрос контактов
 */
export interface ContactAccessResponse {
    success: boolean;
    error?: ContactAccessError;
    contacts?: ContactInfo;
    limit?: {
        current: number;
        max: number;
        resetAt?: string; // ISO date string
    };
    authorType: AuthorType;
    authorName: string;
    authorAvatar?: string;
    authorId: string;
}

/**
 * Запрос на получение контактов
 */
export interface ContactAccessRequest {
    propertyId: string;
    authorId: string;
    authorType: AuthorType;
}

// ============================================================================
// Константы лимитов (для моков)
// ============================================================================

const LIMITS = {
    // Неавторизованные пользователи - только агентства
    anonymous: {
        agency: 5, // в localStorage
    },
    // Бесплатный тариф
    free: {
        owner: 5,   // в день
        agent: 10,  // в день
        agency: 20, // в день
    },
    // Стандартный тариф
    standard: {
        owner: 20,
        agent: 50,
        agency: 100,
    },
    // Максимальный тариф
    maximum: {
        owner: 100,
        agent: 999,
        agency: 999,
    },
} as const;

// ============================================================================
// Локальное хранилище для отслеживания просмотров
// ============================================================================

const STORAGE_KEY = 'realbro_contact_views';
const STORAGE_ANONYMOUS_KEY = 'realbro_anonymous_views';

interface StoredViews {
    [authorId: string]: {
        viewedAt: string;
        contacts: ContactInfo;
    };
}

interface DailyViewCount {
    date: string;
    owners: number;
    agents: number;
    agencies: number;
}

/**
 * Получить просмотренные контакты из localStorage
 */
function getStoredViews(): StoredViews {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Сохранить просмотренные контакты в localStorage
 */
function saveStoredViews(views: StoredViews): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
    } catch {
        console.error('[Contacts] Failed to save views to localStorage');
    }
}

/**
 * Получить счетчик дневных просмотров для анонимных пользователей
 */
function getAnonymousViewCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
        const stored = localStorage.getItem(STORAGE_ANONYMOUS_KEY);
        if (!stored) return 0;
        const data: DailyViewCount = JSON.parse(stored);
        const today = new Date().toDateString();
        if (data.date !== today) return 0;
        return data.agencies;
    } catch {
        return 0;
    }
}

/**
 * Увеличить счетчик дневных просмотров для анонимных пользователей
 */
function incrementAnonymousViewCount(): void {
    if (typeof window === 'undefined') return;
    try {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(STORAGE_ANONYMOUS_KEY);
        let data: DailyViewCount = stored ? JSON.parse(stored) : { date: today, owners: 0, agents: 0, agencies: 0 };
        
        if (data.date !== today) {
            data = { date: today, owners: 0, agents: 0, agencies: 0 };
        }
        
        data.agencies++;
        localStorage.setItem(STORAGE_ANONYMOUS_KEY, JSON.stringify(data));
    } catch {
        console.error('[Contacts] Failed to increment anonymous view count');
    }
}

// ============================================================================
// Мок данные для контактов
// ============================================================================

const MOCK_CONTACTS: Record<string, ContactInfo> = {
    'agent-1': {
        phone: '+34 612 345 678',
        whatsapp: '+34612345678',
        email: 'agent@realestate.es',
        website: 'https://realestate.es',
    },
    'owner-1': {
        phone: '+34 687 654 321',
        whatsapp: '+34687654321',
        telegram: '@property_owner',
        email: 'owner@gmail.com',
    },
    'agency-1': {
        phone: '+34 933 456 789',
        email: 'info@bcn-realty.es',
        website: 'https://bcn-realty.es',
        agencyProfile: '/agencies/bcn-realty',
    },
};

/**
 * Генерировать мок контакты для автора
 */
function generateMockContacts(authorId: string, authorType: AuthorType): ContactInfo {
    // Проверяем есть ли в кэше
    if (MOCK_CONTACTS[authorId]) {
        return MOCK_CONTACTS[authorId];
    }

    // Генерируем на основе ID
    const hash = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const phoneBase = 600000000 + (hash % 99999999);
    
    const contacts: ContactInfo = {
        phone: `+34 ${phoneBase.toString().slice(0, 3)} ${phoneBase.toString().slice(3, 6)} ${phoneBase.toString().slice(6, 9)}`,
    };

    // Добавляем WhatsApp с вероятностью 80%
    if (hash % 5 !== 0) {
        contacts.whatsapp = `+34${phoneBase}`;
    }

    // Telegram для владельцев с вероятностью 40%
    if (authorType === 'owner' && hash % 5 < 2) {
        contacts.telegram = `@user_${authorId.slice(-6)}`;
    }

    // Email всегда для агентств
    if (authorType === 'agency') {
        contacts.email = `info@agency${authorId.slice(-4)}.es`;
        contacts.website = `https://agency${authorId.slice(-4)}.es`;
        contacts.agencyProfile = `/agencies/${authorId}`;
    } else if (hash % 3 === 0) {
        contacts.email = `contact_${authorId.slice(-6)}@gmail.com`;
    }

    return contacts;
}

// ============================================================================
// API функции
// ============================================================================

/**
 * Получить контакты автора объявления
 * 
 * Логика:
 * 1. Если уже просмотрены - возвращаем из кэша
 * 2. Если пользователь не авторизован и автор - владелец, требуем авторизацию
 * 3. Проверяем лимиты тарифа
 * 4. Возвращаем контакты или ошибку
 */
export async function getContactAccess(
    request: ContactAccessRequest,
    options?: {
        isAuthenticated?: boolean;
        userTariff?: 'free' | 'standard' | 'maximum';
    }
): Promise<ContactAccessResponse> {
    const { propertyId, authorId, authorType } = request;
    const { isAuthenticated = false, userTariff = 'free' } = options || {};

    console.log('[Contacts API] Getting contact access', { propertyId, authorId, authorType, isAuthenticated, userTariff });

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    // Проверяем кэш
    const storedViews = getStoredViews();
    if (storedViews[authorId]) {
        console.log('[Contacts API] Returning cached contacts');
        return {
            success: true,
            contacts: storedViews[authorId].contacts,
            authorType,
            authorName: `Author ${authorId.slice(-4)}`,
            authorId,
        };
    }

    // Для неавторизованных
    if (!isAuthenticated) {
        // Владельцы требуют авторизации
        if (authorType === 'owner') {
            console.log('[Contacts API] Auth required for owner contact');
            return {
                success: false,
                error: 'auth_required',
                authorType,
                authorName: `Owner ${authorId.slice(-4)}`,
                authorId,
            };
        }

        // Для агентств проверяем лимит
        if (authorType === 'agency') {
            const currentCount = getAnonymousViewCount();
            if (currentCount >= LIMITS.anonymous.agency) {
                console.log('[Contacts API] Anonymous agency limit exceeded');
                return {
                    success: false,
                    error: 'auth_required',
                    limit: {
                        current: currentCount,
                        max: LIMITS.anonymous.agency,
                    },
                    authorType,
                    authorName: `Agency ${authorId.slice(-4)}`,
                    authorId,
                };
            }
        }
    }

    // Для авторизованных проверяем лимит тарифа
    if (isAuthenticated) {
        const limits = LIMITS[userTariff];
        
        // Мок: всегда разрешаем в dev режиме или возвращаем ошибку с вероятностью 10%
        if (FEATURES.USE_MOCK_PROPERTIES) {
            const shouldFail = Math.random() < 0.1;
            
            if (shouldFail) {
                console.log('[Contacts API] Mock limit exceeded');
                const limitKey = authorType === 'owner' ? 'owner' : authorType === 'agent' ? 'agent' : 'agency';
                return {
                    success: false,
                    error: 'limit_exceeded',
                    limit: {
                        current: limits[limitKey],
                        max: limits[limitKey],
                        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    },
                    authorType,
                    authorName: `${authorType.charAt(0).toUpperCase() + authorType.slice(1)} ${authorId.slice(-4)}`,
                    authorId,
                };
            }
        }
    }

    // Генерируем/получаем контакты
    const contacts = generateMockContacts(authorId, authorType);

    // Сохраняем в кэш
    const newViews = { ...storedViews };
    newViews[authorId] = {
        viewedAt: new Date().toISOString(),
        contacts,
    };
    saveStoredViews(newViews);

    // Увеличиваем счетчик для анонимных
    if (!isAuthenticated && authorType === 'agency') {
        incrementAnonymousViewCount();
    }

    console.log('[Contacts API] Returning contacts', { contacts });

    return {
        success: true,
        contacts,
        authorType,
        authorName: `${authorType.charAt(0).toUpperCase() + authorType.slice(1)} ${authorId.slice(-4)}`,
        authorId,
    };
}

/**
 * Проверить есть ли кэшированные контакты
 */
export function getCachedContacts(authorId: string): ContactInfo | null {
    const storedViews = getStoredViews();
    return storedViews[authorId]?.contacts || null;
}

/**
 * Очистить кэш контактов (для тестов)
 */
export function clearContactsCache(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ANONYMOUS_KEY);
}
