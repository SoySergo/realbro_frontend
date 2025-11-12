# PropertyMap

**Что делает**: Интерактивная карта для отображения объектов недвижимости с использованием Mapbox GL. Показывает маркеры с ценами, поддерживает навигацию и клики по объектам.

**Ключевые особенности**:
- **Пропсы**: 
  - `properties` - массив объектов недвижимости (MapProperty[])
  - `initialViewport` - начальная позиция карты (MapViewport)
  - `onMarkerClick` - callback при клике на маркер
  - `height` - высота карты (по умолчанию 500px)
  - `className` - дополнительные CSS классы

- **Стейт**: 
  - `viewport` - текущая позиция и зум карты

- **API**: 
  - Использует Mapbox GL API через react-map-gl
  - Требует NEXT_PUBLIC_MAPBOX_TOKEN в .env

- **Зависимости**:
  - `mapbox-gl` - библиотека карт
  - `react-map-gl` - React обертка
  - `@/lib/mapbox` - конфигурация Mapbox
  - `@/types/map` - типы MapViewport и MapProperty

**Компоненты**:
- Контролы навигации (zoom, rotate)
- Масштабная линейка
- Кастомные маркеры с ценой
- Счетчик объектов

**Файл**: `src/components/features/map/PropertyMap.tsx`
