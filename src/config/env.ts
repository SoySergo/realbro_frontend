import { z } from 'zod';

const envSchema = z.object({
    // Public variables
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1, 'Mapbox token is required'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

    // API endpoints
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:8080'), // Основной бекенд
    NEXT_PUBLIC_BOUNDARIES_SERVICE_URL: z.string().url().default('http://localhost:8080'), // Микросервис границ

    NEXT_PUBLIC_R2_TILES_URL: z.string().url().optional(),

    // Server-only variables
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Валидация переменных окружения
const env = envSchema.parse({
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BOUNDARIES_SERVICE_URL: process.env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL,
    NEXT_PUBLIC_R2_TILES_URL: process.env.NEXT_PUBLIC_R2_TILES_URL,
    NODE_ENV: process.env.NODE_ENV,
});

export default env;
