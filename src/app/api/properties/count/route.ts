import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/properties/count
 * Получить количество объектов по фильтрам (mock)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Симулируем вычисление count на основе фильтров
    let baseCount = 4500;

    // Каждый фильтр уменьшает count
    if (searchParams.get('minPrice')) {
        baseCount -= Math.min(Number(searchParams.get('minPrice')) / 2, 1000);
    }
    if (searchParams.get('maxPrice')) {
        const maxPrice = Number(searchParams.get('maxPrice'));
        if (maxPrice < 1500) baseCount -= 1500;
        else if (maxPrice < 2500) baseCount -= 500;
    }
    if (searchParams.get('rooms')) {
        const rooms = searchParams.get('rooms')!.split(',');
        baseCount = Math.floor(baseCount * (rooms.length / 5));
    }
    if (searchParams.get('minArea')) {
        baseCount -= Math.min(Number(searchParams.get('minArea')), 500);
    }
    if (searchParams.get('categoryIds')) {
        const cats = searchParams.get('categoryIds')!.split(',');
        baseCount = Math.floor(baseCount * (cats.length / 8));
    }

    // Location filters further reduce count
    const hasLocationFilter =
        searchParams.get('adminLevel2') ||
        searchParams.get('adminLevel4') ||
        searchParams.get('adminLevel6') ||
        searchParams.get('adminLevel7') ||
        searchParams.get('adminLevel8') ||
        searchParams.get('adminLevel9') ||
        searchParams.get('adminLevel10');

    if (hasLocationFilter) {
        baseCount = Math.floor(baseCount * 0.3);
    }

    if (searchParams.get('geometryIds')) {
        baseCount = Math.floor(baseCount * 0.15);
    }

    // Ensure minimum
    const count = Math.max(Math.floor(baseCount + (Math.random() * 100 - 50)), 0);

    return NextResponse.json({ count });
}
