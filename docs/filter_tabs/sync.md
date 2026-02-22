# Синхронизация фильтров и вкладок поиска

## Архитектура

### Два режима работы

1. **Обычный поиск** — фильтры в URL, геометрия сохраняется в `guest` endpoint
2. **Поисковые вкладки** — фильтры синхронизируются с бекендом, геометрия привязана к фильтру

### Ключевые сторы

| Store | Ответственность |
|-------|----------------|
| `useFilterStore` | Текущие фильтры, locationFilter, savedPolygons, activeQueryId |
| `useSidebarStore` | Вкладки поиска (queries), CRUD, debounced sync с бекендом |

### API endpoints

| Endpoint | Описание |
|----------|----------|
| `POST /filters/guest/geometry` | Сохранение геометрии без авторизации (guest) |
| `POST /filters/{filterId}/geometry` | Сохранение геометрии привязанной к фильтру |
| `GET /filters/{filterId}/geometry` | Получение геометрии фильтра |
| `POST /search-tabs` | Создание поисковой вкладки |
| `PUT /search-tabs/{id}` | Обновление вкладки (фильтры, title) |

### Поле `geometry_source`

В `SearchFilters` есть поле `geometry_source: 'guest' | 'filter'`:
- `'guest'` — геометрия сохранена через гостевой endpoint, бекенд при создании вкладки должен перенести
- `'filter'` — геометрия уже привязана к фильтру

---

## Пользовательские сценарии

### Сценарий 1: Поисковая вкладка (авторизованный)

```
1. Пользователь заходит, авторизуется
2. Нажимает "Создать вкладку" → редирект на /search/properties/map
3. В фоне: POST /search-tabs → возвращается ID вкладки
4. Выбирает категорию → ждёт 3 сек → PUT /search-tabs/{id} (debounced sync)
5. Нажимает "Локация" → выбирает мод "Рисование"
6. Рисует полигон → нажимает "Принять" → POST /filters/{filterId}/geometry
7. Рисует второй → "Принять" → POST /filters/{filterId}/geometry
8. Нажимает "Сохранить" → фильтр применяется, polygon_ids в URL
9. Появляются объекты на карте и в сайдбаре
10. Выбирает цену → объекты обновляются
11. Через 3 сек → PUT /search-tabs/{id} (debounced sync фильтров)
```

### Сценарий 2: Обычный поиск → сохранение вкладки

```
1. Пользователь заходит в обычный поиск
2. Нажимает "Локация" → выбирает "Время в пути"
3. Настраивает изохрон → "Сохранить"
4. POST /filters/guest/geometry → полигон в гостевом endpoint
5. geometry_source = 'guest', polygon_ids = [guestId]
6. Нажимает кнопку "Сохранить фильтр" (CloudUpload)
7. Вводит название вкладки → нажимает "Сохранить"
8. POST /search-tabs с filters.geometry_source = 'guest' и polygon_ids
9. Бекенд переносит геометрию из гостевого в фильтр
10. Возвращает ID вкладки, geometry_source → 'filter'
11. Дальнейшие изменения уже синхронизируются через debounced sync
```

### Сценарий 3: Лимит вкладок

```
1. Пользователь хочет сохранить вкладку
2. Бекенд возвращает ошибку лимита
3. Предлагаем: "Заменить существующую" или "Расширить тариф"
```

---

## Debounce стратегия

- **Фильтры на бекенд**: 3 секунды (`SAVE_DEBOUNCE_MS = 3000` в sidebar store)
- **Обновление UI (объекты)**: 300ms (debounce в `useFilterUrlSync`)
- **Количество результатов**: 300ms (debounce в `fetchResultsCount`)

---

## Синхронизация при загрузке

```
1. App загружается → useAuthInit()
2. Если авторизован → GET /search-tabs → загрузка вкладок
3. Если есть activeQueryId → loadFiltersFromQuery(query.filters)
4. Фильтры применяются → URL обновляется → объекты загружаются
5. locationFilter восстанавливается из filters (locationsMeta, geometryIds, etc.)
```

---

## Координация фронт ↔ бек

| Фронтенд поле | Бекенд поле | Описание |
|---------------|-------------|----------|
| `adminLevel2-10` | `country_ids`, `city_ids`, etc. | Локации по уровням |
| `polygon_ids` | `polygon_ids` | UUID геометрий |
| `geometry_source` | `geometry_source` | `'guest'` / `'filter'` |
| `geometryIds` | — | Legacy числовые ID (мок) |
| `radiusCenter` + `radiusKm` | `radius_lat`, `radius_lng`, `radius` | Радиус |
| `isochroneCenter` + `isochroneMinutes` + `isochroneProfile` | — | Изохрон |
