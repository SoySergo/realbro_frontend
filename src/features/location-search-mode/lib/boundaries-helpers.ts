import type { BoundaryFeatureProperties } from '@/entities/boundary';
import type { LocationItem } from '@/entities/location';

/**
 * Преобразует admin_level в тип локации
 * OSM admin_level иерархия:
 * 2 - country (страна)
 * 4 - region (регион/область)
 * 6 - province (провинция)
 * 7 - comarca (комарка/субрегион)
 * 8 - city (город)
 * 9 - district (район города)
 * 10 - neighborhood (квартал/микрорайон)
 */
export function getLocationType(
    adminLevel: number
): 'country' | 'region' | 'province' | 'comarca' | 'city' | 'district' | 'neighborhood' {
    switch (adminLevel) {
        case 2:
            return 'country';
        case 4:
            return 'region';
        case 6:
            return 'province';
        case 7:
            return 'comarca';
        case 8:
            return 'city';
        case 9:
            return 'district';
        case 10:
            return 'neighborhood';
        default:
            return 'neighborhood';
    }
}

/**
 * Получает локализованное имя из properties границы
 * Приоритет: язык пользователя -> базовое имя
 */
export function getDisplayName(props: BoundaryFeatureProperties, userLang: string): string {
    let displayName = props.name;

    if (userLang === 'ru' && props.name_ru) {
        displayName = String(props.name_ru);
    } else if (userLang === 'fr' && props.name_fr) {
        displayName = String(props.name_fr);
    } else if (userLang === 'en' && props.name_en) {
        displayName = String(props.name_en);
    } else if (userLang === 'es' && props.name_es) {
        displayName = String(props.name_es);
    } else if (userLang === 'ca' && props.name_ca) {
        displayName = String(props.name_ca);
    }

    return displayName;
}

/**
 * Преобразует BoundaryFeature в LocationItem для использования в фильтрах
 */
export function boundaryToLocationItem(
    props: BoundaryFeatureProperties,
    userLang: string
): LocationItem {
    return {
        id: props.osm_id,
        name: getDisplayName(props, userLang),
        type: getLocationType(props.admin_level),
        adminLevel: props.admin_level,
        wikidata: typeof props.wikidata === 'string' ? props.wikidata : undefined,
        osmId: props.osm_id,
    };
}

/**
 * Проверяет, имеет ли граница валидный wikidata ID
 */
export function hasValidWikidata(props: BoundaryFeatureProperties): boolean {
    return Boolean(props.wikidata && typeof props.wikidata === 'string');
}
