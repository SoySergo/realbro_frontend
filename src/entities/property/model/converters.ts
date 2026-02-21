/**
 * Конвертеры: Backend DTO → Frontend Card Types
 *
 * Преобразует данные из формата бекенда (PropertyShortListingDTO)
 * в формат фронтенд карточек (PropertyGridCard) для обратной совместимости.
 */

import type { PropertyShortListingDTO, PropertyDetailsDTO } from './api-types';
import type { PropertyGridCard, PropertyCardImage } from './card-types';
import type { Property } from './types';

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

/**
 * Конвертирует PropertyDetailsDTO (бекенд) → Property (фронтенд)
 * 
 * Используется для детальных страниц объектов,
 * где бекенд отдаёт полную информацию в формате PropertyDetailsDTO.
 * 
 * @param dto - ответ бекенда (без id, т.к. запрос по id/slug)
 * @param id - ID объекта (из URL или из запроса)
 */
export function detailsDtoToProperty(dto: PropertyDetailsDTO, id: string): Property {
    // Извлекаем URL фото из media.photos
    const images: string[] = dto.media.photos.map(photo => photo.url);

    return {
        id,
        title: dto.title,
        slug: dto.slug,
        type: 'apartment' as any, // PropertyType is category kind, not deal type
        property_type: dto.property_type,
        property_kind: dto.property_kind,
        category: dto.category as any,
        sub_category: dto.sub_category as any,
        price: dto.price,
        pricePerMeter: dto.area > 0 ? Math.round(dto.price / dto.area) : undefined,
        rooms: dto.rooms ?? 0,
        bathrooms: dto.bathrooms ?? 0,
        area: dto.area,
        floor: dto.floor ?? undefined,
        totalFloors: dto.total_floors ?? undefined,
        address: dto.location.formatted_address,
        coordinates: {
            lat: dto.location.coordinates.lat,
            lng: dto.location.coordinates.lng,
        },
        city: '', // Не возвращается бекендом отдельно, можно извлечь из адреса
        description: dto.description,
        descriptionOriginal: dto.description_original,
        description_original: dto.description_original,
        features: [],
        images,
        createdAt: new Date(dto.published_at),
        updatedAt: new Date(dto.updated_at),
        publishedAt: new Date(dto.published_at),
        published_at_iso: dto.published_at,

        // Автор
        author: {
            id: dto.author.id,
            name: dto.author.name,
            avatar: dto.author.avatar,
            type: dto.author.author_type as 'owner' | 'agent' | 'agency',
            phone: '',
            companyId: dto.author.company_id,
            objectsCount: dto.author.object_count,
            isVerified: dto.author.is_verified,
            agencyName: dto.author.company_name,
            agencyLogo: dto.author.company_logo,
        },

        // Финансовые условия
        deposit_months: dto.deposit_months,
        deposit: dto.deposit,
        agency_fee: dto.agency_fee,
        min_term: dto.min_term,
        max_term: dto.max_term,

        // Площади
        area_useful: dto.area_useful,
        area_kitchen: dto.area_kitchen,
        livingArea: dto.area_useful,
        kitchenArea: dto.area_kitchen,

        // Атрибуты из бекенда
        characteristics: dto.characteristics,
        amenities_dto: dto.amenities,
        tenant_preferences_dto: dto.tenant_preferences,
        tenants_dto: dto.tenants,
        estate_info: dto.estate_info,
        energy_efficiency: dto.energy_efficiency,

        // SEO
        seo_title: dto.seo_title,
        seo_description: dto.seo_description,
        seo_keywords: dto.seo_keywords,

        // Медиа
        video: dto.media.videos.length > 0 ? {
            url: dto.media.videos[0].url,
            thumbnail: dto.media.videos[0].url,
        } : undefined,
        floorPlan: dto.media.plans.length > 0 ? dto.media.plans[0].url : undefined,
    };
}
