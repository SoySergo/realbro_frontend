import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock in-memory store для search queries (вкладок поиска)
 * В продакшене — замена на реальный бекенд
 */
const mockQueries = new Map<string, Record<string, unknown>>();

// Инициализация mock данных
function initMockData() {
    if (mockQueries.size > 0) return;

    const queries = [
        {
            id: 'sq_1',
            title: 'Barcelona Centro',
            filters: {
                adminLevel8: [3128760],
                minPrice: 800,
                maxPrice: 2000,
                rooms: [2, 3],
            },
            resultsCount: 342,
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 'sq_2',
            title: 'Eixample Apartments',
            filters: {
                adminLevel9: [2417889],
                minArea: 60,
                maxPrice: 1500,
                categoryIds: [1],
            },
            resultsCount: 128,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            lastUpdated: new Date(Date.now() - 3600000).toISOString(),
        },
    ];

    for (const q of queries) {
        mockQueries.set(q.id, q);
    }
}

/**
 * GET /api/search-queries
 * Получить все вкладки поиска пользователя
 */
export async function GET() {
    initMockData();

    const queries = Array.from(mockQueries.values()).sort(
        (a, b) =>
            new Date(b.lastUpdated as string).getTime() -
            new Date(a.lastUpdated as string).getTime()
    );

    return NextResponse.json({
        data: queries,
        total: queries.length,
    });
}

/**
 * POST /api/search-queries
 * Создать новую вкладку поиска
 */
export async function POST(request: NextRequest) {
    initMockData();

    const body = await request.json();

    const newQuery = {
        id: `sq_${Date.now()}`,
        title: body.title || 'Новый поиск',
        filters: body.filters || {},
        resultsCount: body.resultsCount || 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    };

    mockQueries.set(newQuery.id, newQuery);

    return NextResponse.json({ data: newQuery }, { status: 201 });
}
