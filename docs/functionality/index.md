# Функциональность проекта

## Компоненты карты
- [PropertyMap](features/map/PropertyMap.md) - Интерактивная карта с маркерами объектов недвижимости

## Поиск и фильтры
- [SearchFilters](features/search/SearchFilters.md) - Компоненты фильтрации (цена, площадь, комнаты, категория, локация, тип маркеров)

## Компоненты сайдбара

### Desktop
- [Sidebar](features/sidebar/Sidebar.md) - Основной боковой сайдбар для desktop (сворачивается/разворачивается)

### Mobile
- [MobileSidebar](features/sidebar/MobileSidebar.md) - Мобильный сайдбар с верхним меню и нижней навигацией
- [BottomNavigation](features/sidebar/BottomNavigation.md) - Нижнее навигационное меню
- [QueryItem](features/sidebar/QueryItem.md) - Переиспользуемый компонент элемента поискового запроса

## API
- [Properties API](api/properties.md) - Работа с недвижимостью

## Stores
- [filterStore](stores/filterStore.md) - Управление фильтрами поиска
- [sidebarStore](stores/sidebarStore.md) - Управление состоянием сайдбара и поисковыми запросами
