/**
 * Конвертеры: Backend DTO → Frontend Card Types
 *
 * Преобразует данные из формата бекенда (PropertyShortListingDTO)
 * в формат фронтенд карточек (PropertyGridCard) для обратной совместимости.
 */

import type { PropertyShortListingDTO } from './api-types';
import type { PropertyGridCard, PropertyCardImage } from './card-types';

/**
 * Конвертирует PropertyShortListingDTO → PropertyGridCard
 * Поддерживает оба формата данных (legacy и backend DTO)
 */
export function dtoToGridCard(dto: PropertyShortListingDTO): PropertyGridCard {
    // Конвертируем media.photos → images (legacy формат)
    const images: PropertyCardImage[] = dto.media.photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        width: photo.width ?? 800,
        height: photo.height ?? 600,
        alt: photo.description ?? dto.title,
    }));

    return {
        id: dto.id,
        title: dto.title,
        slug: dto.slug,
        property_type: dto.property_type,
        property_kind: dto.property_kind,
        category: dto.category,
        sub_category: dto.sub_category,
        price: dto.price,
        price_per_meter: undefined,
        price_per_month: dto.price_per_month,
        rooms: dto.rooms ?? 0,
        bathrooms: dto.bathrooms ?? undefined,
        area: dto.area,
        floor: dto.floor ?? undefined,
        total_floors: dto.total_floors ?? undefined,
        address: dto.location.address,
        // Медиа: оба формата
        media: dto.media,
        images,
        // Локация
        location: dto.location,
        // Транспорт (legacy формат из DTO)
        transport_station: dto.location.transport ? {
            type: dto.location.transport.type as 'metro' | 'train' | 'bus',
            station_name: dto.location.transport.name,
            lines: (dto.location.transport.lines ?? []).map(line => ({
                name: line.name,
                color: line.color ?? '#E50914',
            })),
            walk_minutes: dto.location.transport.walking_duration
                ? Math.round(dto.location.transport.walking_duration / 60)
                : 0,
        } : undefined,
        // Автор
        author: dto.author,
        is_new: false,
        published_at: dto.published_at,
        updated_at: dto.updated_at,
    };
}

/**
 * Конвертирует массив PropertyShortListingDTO[] → PropertyGridCard[]
 */
export function dtosToGridCards(dtos: PropertyShortListingDTO[]): PropertyGridCard[] {
    return dtos.map(dtoToGridCard);
}
