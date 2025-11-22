# Функциональность проекта

## Компоненты карты
- [PropertyMap](features/map/PropertyMap.md) - Интерактивная карта с маркерами объектов недвижимости
- [MapIsochrone](features/map/MapIsochrone.md) - **Новый!** Компонент изохронов с выбором точки, профиля передвижения и времени
- [MapRadius](features/map/MapRadius.md) - **Новый!** Компонент радиуса - круг заданного расстояния от точки

## Поиск и фильтры
- [SearchFilters](features/search/SearchFilters.md) - Компоненты фильтрации (цена, площадь, комнаты, категория, локация, тип маркеров)
- [LocationFilter](features/search/LocationFilter.md) - Фильтр локации с выбором режима (полигоны, рисование, изохрон, радиус)
- [LocationDetailsBar](features/search/LocationDetailsBar.md) - Панель детальных настроек для режима локации
- [LocationSearchMode](features/search/LocationSearchMode.md) - Режим поиска локаций через Mapbox Geocoding API с автокомплитом
- [LocationDrawMode](features/search/LocationDrawMode.md) - Режим рисования произвольной области на карте
- [LocationIsochroneMode](features/search/LocationIsochroneMode.md) - Режим изохрона (время в пути) через Mapbox Isochrone API
- [LocationRadiusMode](features/search/LocationRadiusMode.md) - Режим радиуса от точки

### 🔥 Двухслойная система фильтров
- [📘 README](features/search/LocationFilters-README.md) - **Начни здесь!** Краткая справка по системе
- [📖 TwoLayer](features/search/LocationFilters-TwoLayer.md) - Подробная документация архитектуры
- [🎯 Template](features/search/LocationFilters-Template.md) - Шаблон для создания новых режимов
- [✨ Updates](features/search/LocationFilters-Updates.md) - **Последние улучшения** (кнопки, алерты, клики по карте)

## Компоненты сайдбара

### Desktop
- [Sidebar](features/sidebar/Sidebar.md) - Основной боковой сайдбар для desktop (сворачивается/разворачивается)

### Mobile
- [MobileSidebar](features/sidebar/MobileSidebar.md) - Мобильный сайдбар с верхним меню и нижней навигацией
- [BottomNavigation](features/sidebar/BottomNavigation.md) - Нижнее навигационное меню
- [QueryItem](features/sidebar/QueryItem.md) - Переиспользуемый компонент элемента поискового запроса

## API
- [Properties API](api/properties.md) - Работа с недвижимостью

## UI Компоненты
- [SearchInput](ui/SearchInput.md) - UI инпут поиска с лоадером и кнопкой очистки
- [ComboboxInput](ui/ComboboxInput.md) - Универсальный комбобокс с автокомплитом и клавиатурной навигацией

## Services
- [Mapbox Geocoding](services/mapbox-geocoding.md) - Сервис для поиска мест через Mapbox Geocoding API
- **Mapbox Isochrone** (`src/services/mapbox-isochrone.ts`) - Сервис построения изохронов через Mapbox Isochrone API

## Stores
- [filterStore](stores/filterStore.md) - Управление фильтрами поиска
- [sidebarStore](stores/sidebarStore.md) - Управление состоянием сайдбара и поисковыми запросами
