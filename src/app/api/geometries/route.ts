import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock in-memory store для геометрий (полигоны, изохроны, радиус)
 */
const mockGeometries = new Map<number, Record<string, unknown>>();

let nextId = 1;

/**
 * GET /api/geometries
 * Получить все сохранённые геометрии пользователя
 */
export async function GET() {
    const geometries = Array.from(mockGeometries.values());

    return NextResponse.json({
        data: geometries,
        total: geometries.length,
    });
}

/**
 * POST /api/geometries
 * Сохранить новую геометрию
 * Body: { type: 'polygon'|'isochrone'|'radius', geometry: GeoJSON, name?: string, metadata?: {} }
 */
export async function POST(request: NextRequest) {
    const body = await request.json();

    const { type, geometry, name, metadata } = body;

    if (!type || !geometry) {
        return NextResponse.json(
            { error: 'type and geometry are required' },
            { status: 400 }
        );
    }

    // Валидация типа
    if (!['polygon', 'isochrone', 'radius'].includes(type)) {
        return NextResponse.json(
            { error: 'type must be polygon, isochrone, or radius' },
            { status: 400 }
        );
    }

    // Валидация радиуса
    if (type === 'radius') {
        const { center, radiusKm } = geometry;
        if (!center || !radiusKm) {
            return NextResponse.json(
                { error: 'radius geometry requires center and radiusKm' },
                { status: 400 }
            );
        }
        if (radiusKm < 0.1 || radiusKm > 100) {
            return NextResponse.json(
                { error: 'radiusKm must be between 0.1 and 100' },
                { status: 400 }
            );
        }
    }

    const id = nextId++;

    const newGeometry = {
        id,
        type,
        geometry,
        name: name || `${type}_${id}`,
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
    };

    mockGeometries.set(id, newGeometry);

    return NextResponse.json({ data: newGeometry }, { status: 201 });
}

/**
 * DELETE /api/geometries?id=123
 * Удалить геометрию
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id || !mockGeometries.has(id)) {
        return NextResponse.json(
            { error: 'Geometry not found' },
            { status: 404 }
        );
    }

    mockGeometries.delete(id);

    return NextResponse.json({ success: true });
}
