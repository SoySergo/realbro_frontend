import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock in-memory store (shared with parent route via import)
 * В продакшене — все через реальный бекенд
 */
const mockQueries = new Map<string, Record<string, unknown>>();

/**
 * GET /api/search-queries/:id
 * Получить конкретную вкладку поиска
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const query = mockQueries.get(id);

    if (!query) {
        return NextResponse.json(
            { error: 'Search query not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ data: query });
}

/**
 * PATCH /api/search-queries/:id
 * Обновить вкладку поиска (фильтры, название)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const existing = mockQueries.get(id);

    if (!existing) {
        return NextResponse.json(
            { error: 'Search query not found' },
            { status: 404 }
        );
    }

    const updates = await request.json();

    const updated = {
        ...existing,
        ...updates,
        id, // ID нельзя менять
        lastUpdated: new Date().toISOString(),
    };

    mockQueries.set(id, updated);

    return NextResponse.json({ data: updated });
}

/**
 * DELETE /api/search-queries/:id
 * Удалить вкладку поиска (soft delete)
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!mockQueries.has(id)) {
        return NextResponse.json(
            { error: 'Search query not found' },
            { status: 404 }
        );
    }

    mockQueries.delete(id);

    return NextResponse.json({ success: true });
}
