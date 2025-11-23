# LocationSearch

**Что делает**: Универсальный компонент поиска локаций через Mapbox Geocoding API с автокомплитом.

**Ключевые особенности**:
- Пропсы: 
  - `onLocationSelect` - колбэк при выборе локации
  - `selectedCoordinates` - текущая выбранная точка
  - `selectedName` - название выбранной точки
  - `onClear` - очистка выбранной локации
  - `placeholder` - кастомный плейсхолдер для поиска
- Стейт: query (поисковый запрос), results (результаты Mapbox), isOpen (состояние дропдауна)
- API: Mapbox Geocoding через `searchLocations` из `@/services/mapbox-geocoding`
- Особенности:
  - Дебаунс поиска 300ms
  - Навигация стрелками по результатам
  - Закрытие по ESC или клику вне компонента
  - Локализация через `next-intl` (namespace: `locationFilter`)

**Файл**: `src/components/shared/LocationSearch.tsx`

**Используется в**: 
- Isochrone режим фильтра локации
- Radius режим фильтра локации
- Draw режим фильтра локации (планируется)
