# Plan: location — Bug Fixes (11.03)

> **Сервис**: `location` (сервис обогащения данных о местоположении)  
> **Стек**: Go, PostgreSQL/PostGIS, OpenStreetMap данные  
> **Итерация**: 4  

---

## TL;DR

2 задачи. Критичная: в ответах на запросы обогащения (`EnrichLocationBatch`) попадают линии без `ref` с длинными описательными именами (напр. `"602 Figueres - Girona - Barcelona - Aeroport del Prat"`), которые растягивают карточки объектов на фронтенде. Приоритет транспортных линий только 2-уровневый (metro/остальные), нужна 4-уровневая система.

---

## B2.1. Фильтрация транспортных линий при обогащении

### Проблема 1: Длинные названия линий без ref

**Файл**: `internal/repository/postgresosm/transport_repository.go` строка 1497

Функция `GetLinesByStationIDsBatch` возвращает линии без `ref` — это длинные описательные имена маршрутов:
```json
{
    "id": -19307264,
    "name": "602 Figueres - Girona - Barcelona - Aeroport del Prat",
    "type": "bus"
}
```

**Исправление**: Добавить фильтр в SQL-запрос:
```sql
WHERE l.ref IS NOT NULL AND l.ref != ''
```

Именно у таких линий нет `ref` — они содержат полные описательные имена маршрутов. Линии с `ref` всегда имеют короткое название (напр. `"L1"`, `"R2"`, `"H10"`).

---

### Проблема 2: Приоритет транспортных типов

**Файл**: `internal/repository/postgresosm/transport_repository.go` строки 1195–1200

**Текущая** система: 2 уровня (metro/остальные).

**Новая** 4-уровневая система `priority_rank`:

| Ранг | Тип | Описание |
|------|-----|----------|
| 1 | `metro` | Метро (Barcelona Metro, L1–L12) |
| 2 | `train` | Поезда (Cercanías R1, R2, R3...) |
| 3 | `tram` | Трамваи (T1–T6) |
| 4 | `bus` | Автобусы |

**Изменения в SQL** (~строки 1195–1200):
```sql
CASE transport_type
    WHEN 'metro' THEN 1
    WHEN 'train' THEN 2
    WHEN 'tram'  THEN 3
    WHEN 'bus'   THEN 4
    ELSE 5
END AS priority_rank
```

**Файл**: `internal/usecase/transport_usecase.go` строка 280

Обновить логику `hasHighPriority` — учитывать 4 ранга (ранее проверяла только metro):
```go
// Было: hasHighPriority = station.TransportType == "metro"
// Стало: учитываем ранг — metro и train считаются "высоким приоритетом"
hasHighPriority = station.PriorityRank <= 2
```

> **Логика**: При обогащении данных, если уже есть станция метро или поезда, станции трамвая и автобуса имеют меньший приоритет и могут быть исключены при лимите.

---

## Verification

| Задача | Как проверить |
|--------|---------------|
| ref-фильтр | Запрос `EnrichLocationBatch` для объекта рядом с Sants — линии без `ref` не возвращаются |
| 4-уровневый приоритет | Для станции с metro + bus — сначала идёт metro (`priority_rank=1`), потом bus (`priority_rank=4`) |
| Нет длинных имён | Нет линий с именем длиннее 10 символов (все только `ref`: `L1`, `R2`, `H10` и т.д.) |

**Пример корректного ответа** после фикса:
```json
{
    "stations": [
        {
            "name": "Sants Estació",
            "type": "train",
            "lines": [
                { "ref": "R1", "color": "#E30613" },
                { "ref": "R2", "color": "#009F6B" }
            ]
        },
        {
            "name": "Plaça de Sants",
            "type": "metro",
            "lines": [
                { "ref": "L5", "color": "#9B59B6" }
            ]
        }
    ]
}
```

**Пример некорректного ответа** (до фикса — такого быть не должно):
```json
{
    "lines": [
        {
            "name": "602 Figueres - Girona - Barcelona - Aeroport del Prat",
            "ref": null,
            "type": "bus"
        }
    ]
}
```
