import { z } from 'zod';

const envSchema = z.object({
    // Public variables
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1, 'Mapbox token is required'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

    // Server-only variables
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Валидация переменных окружения
const env = envSchema.parse({
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
});

export default env;
