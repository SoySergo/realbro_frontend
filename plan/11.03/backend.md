# Plan: realbro_backend — Bug Fixes (11.03)

> **Сервис**: `realbro_backend`  
> **Стек**: Go, PostgreSQL, PostGIS  
> **Итерация**: 4  

---

## TL;DR

4 задачи. Критичная: функция `geometryToGeoJSON()` использует `json.Marshal` вместо `geojson.Encode` — результат невалидный GeoJSON, PostgreSQL/PostGIS выдаёт `invalid GeoJSON representation`. Остальные: категории для UI, slug для компаний, интеграционные тесты.

---

## A2. Категории / субкатегории для UI

**Статус**: Эндпоинты уже существуют.

**Файл**: `internal/delivery/http/v1/dictionary/handler.go`

Убедиться, что эндпоинты возвращают данные в нужном формате:
- `GET /api/v1/dictionaries/categories?lang=X` → `[{ id, name, code }]`
- `GET /api/v1/dictionaries/categories/:id/subcategories?lang=X` → `[{ id, name, code, category_id }]`

**Категории (IDs)**:
| id | name | code |
|----|------|------|
| 1 | room | room |
| 2 | apartment | apartment |
| 3 | house | house |

**Проверить**: корректный CORS и формат ответа для фронтенда. Если нет сортировки — добавить `ORDER BY id`.

---

## A7. Ошибка сохранения геометрии — invalid GeoJSON (КРИТИЧНО)

**Лог ошибки**:
```
filter/repository.go:251  failed to create filter geometry
{"error": "ERROR: invalid GeoJSON representation (SQLSTATE XX000)", "filterID": "00000000-..."}
filter/service.go:311     failed to create guest geometry
filter/handler.go:813     Failed to create guest geometry → HTTP 500
```

**Файл**: `internal/repository/filter/repository.go` строки 335–345

**Корневая причина**: Функция `geometryToGeoJSON()` вызывает `json.Marshal(geom)` на значении типа `go-geom.T`, что сериализует **внутреннюю Go-структуру**, а не валидный GeoJSON.

**Исправление** (выбрать один вариант):

### Вариант A (рекомендован): использовать `geojson.Encode`
```go
import "github.com/twpayne/go-geom/encoding/geojson"

func geometryToGeoJSON(geom geom.T) ([]byte, error) {
    return geojson.Marshal(geom)
    // или: geojson.Encode(geom) если возвращает io.Writer
}
```

### Вариант B: передавать оригинальную GeoJSON-строку из запроса
Минуя `decode → encode roundtrip` — сохранять исходную строку запроса напрямую в SQL. Менее предпочтителен (нет валидации на уровне Go).

**Verification**: После фикса `POST /api/v1/filters/guest/geometry` с валидным GeoJSON Polygon должен вернуть `HTTP 200`.

```bash
curl -X POST http://localhost:8080/api/v1/filters/guest/geometry \
  -H "Content-Type: application/json" \
  -d '{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[2.1, 41.3],[2.2, 41.3],[2.2, 41.4],[2.1, 41.4],[2.1, 41.3]]]
    }
  }'
# Ожидаем: 200 OK, не 500
```

---

## B3. Agency slug — генерация при nil (бекенд часть)

**Файл**: `internal/domain/company/entity.go`

`Slug *string` может быть `nil`. DTO с `omitempty` отбрасывает пустой slug → фронтенд получает `undefined`.

**Исправление**: При создании или обновлении компании генерировать slug из имени, если `Slug == nil`:

```go
import "github.com/gosimple/slug"

func GenerateSlug(name string) string {
    return slug.Make(name)
}

// В use case при создании компании:
if company.Slug == nil || *company.Slug == "" {
    s := GenerateSlug(company.Name)
    company.Slug = &s
}
```

Проверить handler создания/обновления компании — убедиться что slug сохраняется в БД.

---

## A9. Интеграционные тесты: фильтры с маркерами + локациями

**Контекст**: Параметры `polygon_ids`, `exclude_ids`, `include_ids`, `location_ids` уже проходят в SQL через `toListParams()`, `toCountParams()`, `toMVTParams()`.

**Написать тесты** для комбинаций:

| Тест | Параметры |
|------|-----------|
| polygon_only | `polygon_ids=[id1]` |
| location_only | `location_ids=[id1]` |
| polygon + location | `polygon_ids=[id1] + location_ids=[id2]` |
| polygon + markers | `polygon_ids=[id1] + include_ids=[m1,m2]` |
| polygon + exclude | `polygon_ids=[id1] + exclude_ids=[m3]` |
| location + markers | `location_ids=[id1] + include_ids=[m1]` |
| all combined | `polygon_ids + location_ids + include_ids + exclude_ids` |

Проверить что:
1. `toListParams()` корректно формирует SQL WHERE для каждой комбинации
2. `toCountParams()` возвращает правильный count
3. `toMVTParams()` генерирует корректные тайлы
4. Нет SQL-инъекций при передаче массивов IDs

**Файлы для тестов**:
- `internal/repository/property/repository_test.go`
- `internal/usecase/property/usecase_test.go`

---

## Verification Summary

| Задача | Статус | Проверка |
|--------|--------|----------|
| A2 | Проверить | `GET /api/v1/dictionaries/categories?lang=ru` → `[{id:1, name:"Комната"}, ...]` |
| A7 | 🔴 Критично | `POST /api/v1/filters/guest/geometry` → `200 OK` (не `500`) |
| B3 | Реализовать | Создать компанию без slug → slug генерируется автоматически |
| A9 | Написать тесты | Все комбинации фильтров проходят без ошибок |
