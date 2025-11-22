# Mapbox Geocoding Service

**Что делает**: Сервис для поиска мест (городов, регионов, районов, стран) через Mapbox Geocoding API.

**Ключевые функции**:

### `searchLocations(params: GeocodingSearchParams): Promise<MapboxLocation[]>`
Поиск мест по запросу с поддержкой языков и фильтрацией типов.

**Параметры**:
- `query: string` - поисковый запрос
- `language?: string` - язык результатов (ru, en, fr)
- `types?: MapboxPlaceType[]` - фильтр по типам мест
- `limit?: number` - лимит результатов (по умолчанию 10)
- `proximity?: [lng, lat]` - координаты для приоритета близости
- `bbox?: [minLng, minLat, maxLng, maxLat]` - ограничение области поиска

**Возвращает**: массив `MapboxLocation` с полями:
- `id: string` - уникальный ID места
- `name: string` - название
- `placeType: MapboxPlaceType` - тип места (country, region, place, district, etc)
- `coordinates: [lng, lat]` - координаты центра
- `bbox?: [minLng, minLat, maxLng, maxLat]` - границы области
- `context?: string` - полное имя с иерархией ("Paris, Île-de-France, France")
- `wikidata?: string` - ID в Wikidata

### `getPlaceById(placeId: string, language?: string): Promise<MapboxLocation | null>`
Получить место по ID.

### Вспомогательные функции:

- `mapPlaceTypeToLocationType(placeType)` - преобразует Mapbox тип в тип для существующей системы
- `getAdminLevelForPlaceType(placeType)` - получает OSM admin_level для типа места

**Типы мест** (MapboxPlaceType):
- `country` - Страна (admin_level 2)
- `region` - Регион/штат (admin_level 4)
- `place` - Город (admin_level 8)
- `district` - Район (admin_level 9)
- `neighborhood` - Квартал (admin_level 10)
- `locality` - Населённый пункт
- `postcode` - Почтовый индекс
- `address` - Адрес
- `poi` - Точка интереса

**Использование**:
```typescript
import { searchLocations } from '@/services/mapbox-geocoding';

const results = await searchLocations({
  query: 'Paris',
  language: 'ru',
  limit: 5,
});
```

**Файл**: `src/services/mapbox-geocoding.ts`

**API Documentation**: https://docs.mapbox.com/api/search/geocoding/
