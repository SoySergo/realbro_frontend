# LocationDetailsBar

**Что делает**: Панель детальных настроек для выбранного режима локационного фильтра. Отображается во втором ряду под основными фильтрами. Компонент организован модульно - каждый режим вынесен в отдельный подкомпонент.

## Структура

Главный компонент `LocationDetailsBar` служит контейнером и роутером для четырёх режимов:

### Подкомпоненты

#### 1. **LocationSearchMode** (`location-details/LocationSearchMode.tsx`)
- Инпут с автокомплитом для поиска локаций
- Dropdown с результатами поиска (города, регионы, районы, страны)
- Отображение выбранных локаций в виде тегов
- Мокированные данные (TODO: подключить реальный API)
- **Пропс**: `onApply(locations: LocationItem[])`

#### 2. **LocationDrawMode** (`location-details/LocationDrawMode.tsx`)
- Простой режим для активации рисования на карте
- Кнопка "Начать рисование"
- **Пропс**: `onActivateDrawing()`
- TODO: Интеграция с Mapbox Draw

#### 3. **LocationIsochroneMode** (`location-details/LocationIsochroneMode.tsx`)
- Выбор профиля транспорта: walking, cycling, driving
- Выбор времени: 5, 10, 15, 30, 45, 60 минут
- Локальное состояние для настроек
- **Пропс**: `onApply(profile: IsochroneProfile, minutes: number)`

#### 4. **LocationRadiusMode** (`location-details/LocationRadiusMode.tsx`)
- Выбор радиуса: 1, 3, 5, 10, 15, 20 км
- Локальное состояние для выбранного радиуса
- **Пропс**: `onApply(radiusKm: number)`

## Главный компонент

**Что делает**: Управляет видимостью панели и делегирует рендеринг подкомпонентам в зависимости от `activeLocationMode`.

**Ключевые особенности**:
- **Условный рендер**: Показывается только когда `activeLocationMode !== null`
- **Роутинг режимов**: Switch по `activeLocationMode` → рендер соответствующего подкомпонента
- **Обработчики**: Для каждого режима свой callback (handleSearchApply, handleDrawActivate и т.д.)
- **Стейт**: `useFilterStore()` для управления активным режимом
- **Стили**: Консистентны с основными фильтрами, адаптированы под тёмную тему

**Пропсы**: Нет (использует глобальный стор)

**Файлы**: 
- Главный: `src/components/features/search/LocationDetailsBar.tsx`
- Подкомпоненты: `src/components/features/search/location-details/`
- Экспорты: `src/components/features/search/location-details/index.ts`

**Интеграция**:
- Размещается на странице `search` под `FilterBar`
- Управляется через `setLocationMode()` в сторе
- Закрывается по клику на крестик или после применения настроек (кроме режима Draw)

## TODO
- [ ] Подключить реальный API для поиска локаций (LocationSearchMode)
- [ ] Интеграция с Mapbox Draw (LocationDrawMode)
- [ ] Сохранение выбранных настроек в глобальный стор
- [ ] Обработка применения фильтров (сейчас только console.log)

