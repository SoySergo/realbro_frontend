/**
 * Утилита для получения базового URL API.
 * На клиенте — относительный URL (прокси через Next.js rewrites), на сервере — прямой.
 */

const backendOrigin = typeof window !== 'undefined'
    ? ''
    : (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');

/**
 * Базовый URL API (включая /api/v1 префикс)
 */
export function getApiV1Base(): string {
    return `${backendOrigin}/api/v1`;
}

/**
 * Базовый URL бекенда (без /api/v1)
 */
export function getApiOrigin(): string {
    return backendOrigin;
}

/**
 * API-префикс
 */
export function getApiPrefix(): string {
    return '/api/v1';
}
