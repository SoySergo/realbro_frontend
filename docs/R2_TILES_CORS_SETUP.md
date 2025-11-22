# Настройка CORS для Cloudflare R2 для векторных тайлов

## Проблема
При загрузке векторных тайлов из Cloudflare R2 возникает ошибка CORS (Cross-Origin Resource Sharing), так как браузер блокирует запросы к ресурсам с другого домена.

## Решение

### 1. Через Cloudflare Dashboard

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Перейдите в раздел **R2** → выберите ваш bucket
3. Откройте вкладку **Settings**
4. Найдите секцию **CORS Policy**
5. Добавьте следующую конфигурацию:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2. Через Wrangler CLI

Создайте файл `cors.json`:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

Затем примените конфигурацию:

```bash
wrangler r2 bucket cors put YOUR_BUCKET_NAME --file cors.json
```

### 3. Проверка CORS

После настройки проверьте заголовки:

```bash
curl -I https://pub-4d5958e4af644401b93b143a00911536.r2.dev/tiles/0/0/0.pbf
```

Вы должны увидеть заголовки:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, HEAD`

## Определение имени слоя в PBF тайлах

Чтобы узнать имя слоя в ваших PBF тайлах:

### Способ 1: Использовать mbview

```bash
npm install -g @mapbox/mbview
mbview path/to/tiles/0/0/0.pbf
```

### Способ 2: Использовать vt-pbf inspector

```bash
npm install -g @mapbox/vt-pbf
vt-pbf path/to/tiles/0/0/0.pbf
```

### Способ 3: Через Python

```python
import mapbox_vector_tile

with open('0.pbf', 'rb') as f:
    data = f.read()
    tile = mapbox_vector_tile.decode(data)
    print("Available layers:", list(tile.keys()))
```

### Способ 4: Посмотреть в коде генерации тайлов

Если вы генерировали тайлы с помощью tippecanoe:

```bash
tippecanoe -o output.mbtiles --layer=boundaries input.geojson
```

Имя слоя будет `boundaries` (из параметра `--layer`).

## Типичные имена слоев OSM

Если вы используете стандартные OSM тайлы, попробуйте:
- `default`
- `osm`
- `boundaries`
- `boundary`
- `admin`
- `administrative`

## Рекомендуемая настройка CORS для продакшена

Для продакшена используйте более строгую политику:

```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range", "If-None-Match"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Accept-Ranges"],
    "MaxAgeSeconds": 86400
  }
]
```

## Дополнительные заголовки для оптимизации

Убедитесь, что ваши тайлы имеют правильный Content-Type:

- **Content-Type**: `application/x-protobuf` или `application/vnd.mapbox-vector-tile`
- **Content-Encoding**: `gzip` (если тайлы сжаты)
- **Cache-Control**: `public, max-age=31536000, immutable`

## Troubleshooting

### Проблема: Тайлы не загружаются
1. Проверьте CORS заголовки
2. Убедитесь, что URL правильный
3. Проверьте, что bucket публичный
4. Проверьте имя слоя в PBF файлах

### Проблема: ERR_BLOCKED_BY_CORS
Добавьте заголовок `Access-Control-Allow-Origin: *` в CORS политику

### Проблема: Неизвестное имя слоя
Используйте компонент TilesTestClient для переключения между возможными именами слоев
