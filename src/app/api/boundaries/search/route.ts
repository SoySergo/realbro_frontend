import { NextRequest, NextResponse } from 'next/server';
import env from '@/shared/config/env';

/**
 * API для поиска границ (boundaries) по названию
 * GET /api/boundaries/search?q=Paris&lang=en
 */

// SearchResult - результат поиска границы (соответствует бекенду)
interface SearchResult {
    id: string; // Converted to string for frontend
    name: string;
    type: string;
    admin_level?: number;
    center_lat: number;
    center_lon: number;
    area_sq_km?: number;
}

// Типы для фронтенда
type LocationType = 'country' | 'province' | 'city' | 'district' | 'neighborhood';

// Маппинг admin_level в тип локации
function mapAdminLevelToType(adminLevel?: number): LocationType {
    if (!adminLevel) return 'city';

    switch (adminLevel) {
        case 2:
            return 'country';
        case 4:
            return 'province';
        case 6:
            return 'city';
        case 8:
            return 'district';
        case 10:
            return 'neighborhood';
        default:
            return 'city';
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const lang = searchParams.get('lang') || 'en';

        // Валидация query параметра
        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required and must be at least 2 characters' },
                { status: 400 }
            );
        }

        console.log('Searching boundaries:', { query, lang });

        // Прокси запрос к микросервису границ
        const backendUrl = `${env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL}/api/v1/boundaries/search`;
        const backendParams = new URLSearchParams({
            q: query.trim(),
            lang,
        });

        const response = await fetch(`${backendUrl}?${backendParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Кэширование на 5 минут
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            console.error('Backend search failed:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Failed to fetch boundaries from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log('Backend response:', data);

        // Проверяем структуру ответа
        if (!data || typeof data !== 'object') {
            console.error('Invalid response format:', data);
            return NextResponse.json([]);
        }

        // Если data.results существует (формат SearchResponse)
        if (Array.isArray(data.results)) {
            console.log('Boundaries search results:', data.results.length);

            const transformedResults = data.results.map((result: SearchResult) => ({
                id: parseInt(result.id),
                name: result.name,
                type: mapAdminLevelToType(result.admin_level),
                centerLat: result.center_lat,
                centerLon: result.center_lon,
                areaSqKm: result.area_sq_km,
            }));

            return NextResponse.json(transformedResults);
        }

        // Если data сам является массивом результатов
        if (Array.isArray(data)) {
            console.log('Boundaries search results (array):', data.length);

            const transformedResults = data.map((result: SearchResult) => ({
                id: parseInt(result.id),
                name: result.name,
                type: mapAdminLevelToType(result.admin_level),
                centerLat: result.center_lat,
                centerLon: result.center_lon,
                areaSqKm: result.area_sq_km,
            }));

            return NextResponse.json(transformedResults);
        }

        // Неизвестный формат
        console.error('Unknown response format:', data);
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error searching boundaries:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
