# MapIsochrone - Компонент изохронов для Mapbox

**Что делает**: Позволяет пользователю выбрать точку на карте (кликом или через поиск), выбрать профиль передвижения (пешком, велосипед, машина, машина с трафиком) и время в пути, после чего отображает изохрон - область, которую можно достичь за указанное время.

## Ключевые особенности

### Компоненты
- **MapIsochrone** - главный компонент с логикой и интеграцией карты
- **IsochroneControls** - UI для выбора профиля (иконки) и времени (слайдер)
- **IsochroneAddressSearch** - поиск адреса с автокомплитом через Mapbox Geocoding

### Профили передвижения
- `walking` - Пешком (зелёный маркер)
- `cycling` - Велосипед (жёлтый маркер)
- `driving` - Машина (синий маркер)
- `driving-traffic` - Машина с трафиком (красный маркер)

### Время в пути
- Шаги: 5, 10, 15, 30, 45, 60 минут
- Максимум 60 минут (ограничение Mapbox Isochrone API)

### API
- **Mapbox Geocoding API** - поиск адресов и мест
- **Mapbox Isochrone API** - построение изохронов

### Локализация
- Все тексты UI через `messages/{locale}.json`
- Ключи в секции `isochrone`
- Поддержка: en, ru, fr

## Использование

```tsx
import { MapIsochrone } from '@/components/features/map/MapIsochrone';

<MapIsochrone map={mapInstance} className="w-96" />
```

## Файлы
- `/src/components/features/map/MapIsochrone.tsx` - главный компонент
- `/src/components/features/map/IsochroneControls.tsx` - UI управления
- `/src/components/features/map/IsochroneAddressSearch.tsx` - поиск адреса
- `/src/services/mapbox-isochrone.ts` - сервис изохронов (уже существовал)
- `/src/services/mapbox-geocoding.ts` - сервис геокодинга (уже существовал)

## Тестовая страница
`/test/isochrone` - демо-страница с полной функциональностью
