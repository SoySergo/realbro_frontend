# Кластеры объектов — Документация для синхронизации с бекендом

## Обзор

Кластеризация используется для группировки близко расположенных объектов недвижимости на карте. Это улучшает производительность и UX при большом количестве маркеров.

**Основные сценарии:**

1. **Автоматическая кластеризация** — на малых зумах объекты группируются в кластеры
2. **Клик по кластеру** — показ объектов кластера в сайдбаре
3. **Зум к кластеру** — приближение к области кластера
4. **Отмена выборки** — возврат к обычному отображению

---

## Типы данных

### Cluster (Кластер на карте)

```typescript
interface Cluster {
  id: string;                    // Уникальный ID кластера
  coordinates: [number, number]; // [lng, lat] - центр кластера
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  pointCount: number;            // Количество объектов в кластере
  propertyIds: string[];         // IDs объектов в кластере
  zoom: number;                  // Уровень зума, на котором кластер сформирован
  
  // Агрегированные данные для отображения
  priceRange?: {
    min: number;
    max: number;
    avg: number;
  };
  
  categoryDistribution?: {
    category: PropertyCategory;
    count: number;
  }[];
}
```

### ClusterExpansionZoom

```typescript
interface ClusterExpansionZoom {
  clusterId: string;
  zoom: number;                  // Зум, на котором кластер распадется
}
```

---

## API Endpoints

### 1. Получение объектов кластера

**Endpoint:** `POST /api/properties/cluster`

**Request body:**

```typescript
interface GetClusterPropertiesRequest {
  ids: string[];                 // IDs объектов в кластере
  lang?: string;                 // Язык локализации
}
```

**Response:**

```typescript
interface GetClusterPropertiesResponse {
  properties: Property[];
  cluster: {
    id: string;
    coordinates: [number, number];
    pointCount: number;
    bbox?: [number, number, number, number];
  };
}
```

**Пример запроса:**

```json
POST /api/properties/cluster

{
  "ids": ["prop-123", "prop-456", "prop-789", "prop-101"],
  "lang": "ru"
}
```

**Особенности:**

- Возвращает полные данные Property для отображения в сайдбаре
- Порядок соответствует порядку IDs в запросе
- Если какой-то ID не найден — игнорируется (без ошибки)

---

### 2. Получение зума распада кластера

**Endpoint:** `GET /api/properties/cluster/:id/expansion-zoom`

**Response:**

```typescript
interface GetExpansionZoomResponse {
  clusterId: string;
  expansionZoom: number;         // Зум, на котором кластер распадется
  currentZoom: number;           // Текущий зум карты
  canExpand: boolean;            // Можно ли распустить кластер
}
```

**Использование:**

- Определяет, до какого зума нужно приблизить карту, чтобы кластер распался
- Используется для анимированного зума к кластеру

**Пример запроса:**

```
GET /api/properties/cluster/cluster-abc123/expansion-zoom
```

---

### 3. Получение статистики кластера

**Endpoint:** `GET /api/properties/cluster/:id/stats`

**Response:**

```typescript
interface GetClusterStatsResponse {
  clusterId: string;
  pointCount: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  areaRange: {
    min: number;
    max: number;
    avg: number;
  };
  roomsDistribution: {
    rooms: number;
    count: number;
    percentage: number;
  }[];
  categoryDistribution: {
    category: PropertyCategory;
    count: number;
    percentage: number;
  }[];
  topFeatures: {
    feature: PropertyFeature;
    count: number;
    percentage: number;
  }[];
}
```

**Использование:**

- Отображение статистики в тултипе кластера
- Аналитика для пользователя

---

## Отображение на карте

### Vector Tiles (PBF)

Кластеры генерируются на бекенде и возвращаются в PBF tiles вместе с объектами.

**Слой кластеров в PBF:**

```typescript
// Source-layer: 'clusters'
interface ClusterFeatureProperties {
  cluster: true;
  cluster_id: string;
  point_count: number;
  point_count_abbreviated: string; // "100+", "1K+", etc.
  lng: number;
  lat: number;
  
  // Дополнительные данные
  price_min?: number;
  price_max?: number;
  price_avg?: number;
}
```

### Mapbox GL JS конфигурация

**Source:**

```typescript
map.addSource('properties', {
  type: 'vector',
  tiles: ['/api/properties/tiles/{z}/{x}/{y}.pbf?filters...'],
  minzoom: 0,
  maxzoom: 18,
});
```

**Layer для кластеров:**

```typescript
// Кружки кластеров
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  'source-layer': 'clusters',
  filter: ['has', 'cluster'],
  paint: {
    // Размер зависит от количества объектов
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,  // < 10: 20px
      10, 30,  // 10-50: 30px
      50, 40,  // 50-100: 40px
      100, 50  // 100+: 50px
    ],
    'circle-color': [
      'step',
      ['get', 'point_count'],
      'hsl(210, 100%, 60%)',  // < 10
      10, 'hsl(210, 100%, 55%)',  // 10-50
      50, 'hsl(210, 100%, 50%)',  // 50-100
      100, 'hsl(210, 100%, 45%)'  // 100+
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
});

// Текст (количество объектов)
map.addLayer({
  id: 'cluster-count',
  type: 'symbol',
  source: 'properties',
  'source-layer': 'clusters',
  filter: ['has', 'cluster'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 14,
  },
  paint: {
    'text-color': '#ffffff',
  },
});
```

**Layer для единичных объектов:**

```typescript
map.addLayer({
  id: 'properties-markers',
  type: 'circle',
  source: 'properties',
  'source-layer': 'properties',
  filter: ['!', ['has', 'cluster']],
  paint: {
    'circle-radius': 8,
    'circle-color': '#3b82f6',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
});
```

---

## Взаимодействие с кластерами

### 1. Клик по кластеру

**Сценарий:**

1. Пользователь кликает на кластер
2. Получаем IDs объектов кластера из feature properties
3. Запрашиваем полные данные через `/api/properties/cluster`
4. Отображаем объекты в сайдбаре
5. Показываем кнопку "Отменить выборку кластера"

**Реализация:**

```typescript
map.on('click', 'clusters', async (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters'],
  });
  
  if (!features.length) return;
  
  const clusterId = features[0].properties.cluster_id;
  const coordinates = features[0].geometry.coordinates;
  
  // Получаем список объектов кластера
  const clusterSource = map.getSource('properties') as mapboxgl.GeoJSONSource;
  const propertyIds = await getClusterLeaves(clusterSource, clusterId);
  
  // Запрашиваем полные данные
  const { properties, cluster } = await fetchClusterProperties(propertyIds);
  
  // Отображаем в сайдбаре
  setSidebarMode('cluster');
  setClusterProperties(properties);
  setActiveCluster(cluster);
  
  // Подсвечиваем кластер на карте
  map.setFeatureState(
    { source: 'properties', sourceLayer: 'clusters', id: clusterId },
    { selected: true }
  );
});
```

**Helper функция для получения IDs:**

```typescript
const getClusterLeaves = async (
  source: mapboxgl.GeoJSONSource,
  clusterId: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    source.getClusterLeaves(
      parseInt(clusterId),
      Infinity,
      0,
      (error, features) => {
        if (error) {
          console.error('Error getting cluster leaves:', error);
          resolve([]);
          return;
        }
        
        const ids = features.map(f => f.properties.id);
        resolve(ids);
      }
    );
  });
};
```

---

### 2. Зум к кластеру

**Сценарий:**

1. Пользователь двойной клик по кластеру
2. Получаем зум распада кластера
3. Анимированно приближаемся к этому зуму

**Реализация:**

```typescript
map.on('dblclick', 'clusters', async (e) => {
  e.preventDefault();
  
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters'],
  });
  
  if (!features.length) return;
  
  const clusterId = features[0].properties.cluster_id;
  const coordinates = features[0].geometry.coordinates;
  
  // Получаем зум распада
  const { expansionZoom } = await fetchExpansionZoom(clusterId);
  
  // Анимированный зум
  map.easeTo({
    center: coordinates as [number, number],
    zoom: expansionZoom,
    duration: 500,
  });
});
```

---

### 3. Ховер на кластере

**Сценарий:**

1. Пользователь наводит курсор на кластер
2. Показывается тултип со статистикой

**Реализация:**

```typescript
map.on('mouseenter', 'clusters', async (e) => {
  map.getCanvas().style.cursor = 'pointer';
  
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters'],
  });
  
  if (!features.length) return;
  
  const clusterId = features[0].properties.cluster_id;
  const pointCount = features[0].properties.point_count;
  const coordinates = features[0].geometry.coordinates;
  
  // Получаем статистику (с кешированием)
  const stats = await fetchClusterStats(clusterId);
  
  // Показываем тултип
  new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 20,
  })
    .setLngLat(coordinates as [number, number])
    .setHTML(`
      <div class="cluster-tooltip">
        <div class="font-semibold">${pointCount} объектов</div>
        <div class="text-sm text-text-secondary">
          Цена: ${formatPrice(stats.priceRange.min)} - ${formatPrice(stats.priceRange.max)}
        </div>
      </div>
    `)
    .addTo(map);
});

map.on('mouseleave', 'clusters', () => {
  map.getCanvas().style.cursor = '';
  // Закрыть тултип
});
```

---

## Сайдбар с объектами кластера

### UI компонент

```typescript
interface ClusterSidebarProps {
  cluster: Cluster;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onPropertyHover: (property: Property | null) => void;
  onResetCluster: () => void;
}

const ClusterSidebar: FC<ClusterSidebarProps> = ({
  cluster,
  properties,
  onPropertyClick,
  onPropertyHover,
  onResetCluster,
}) => {
  return (
    <div className="cluster-sidebar">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Кластер</h3>
            <p className="text-sm text-text-secondary">
              {cluster.pointCount} объектов
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetCluster}
          >
            <X className="w-4 h-4 mr-2" />
            Отменить выборку
          </Button>
        </div>
        
        {/* Статистика */}
        {cluster.priceRange && (
          <div className="mt-3 text-sm">
            <span className="text-text-secondary">Цена:</span>{' '}
            {formatPrice(cluster.priceRange.min)} -{' '}
            {formatPrice(cluster.priceRange.max)}
          </div>
        )}
      </div>
      
      {/* Список объектов */}
      <div className="p-4 space-y-4">
        {properties.map(property => (
          <PropertyCardGrid
            key={property.id}
            property={property}
            onClick={() => onPropertyClick(property)}
            onMouseEnter={() => onPropertyHover(property)}
            onMouseLeave={() => onPropertyHover(null)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Отмена выборки кластера

```typescript
const resetCluster = () => {
  // 1. Сбросить состояние кластера
  setSidebarMode('normal');
  setClusterProperties([]);
  setActiveCluster(null);
  
  // 2. Убрать подсветку на карте
  map.removeFeatureState({
    source: 'properties',
    sourceLayer: 'clusters',
  });
  
  // 3. Вернуться к обычному отображению объектов
  // (автоматически через useEffect при изменении sidebarMode)
};
```

---

## Подсветка объектов из кластера на карте

### При ховере в сайдбаре

```typescript
const handlePropertyHover = (property: Property | null) => {
  if (!property) {
    // Убрать подсветку
    map.removeFeatureState({
      source: 'properties',
      sourceLayer: 'properties',
    });
    return;
  }
  
  // Подсветить объект на карте
  map.setFeatureState(
    {
      source: 'properties',
      sourceLayer: 'properties',
      id: property.id,
    },
    { hovered: true }
  );
  
  // Центрировать карту на объекте (опционально)
  const { coordinates } = property;
  map.easeTo({
    center: [coordinates.lng, coordinates.lat],
    duration: 300,
  });
};
```

### Стилизация подсвеченных объектов

```typescript
map.addLayer({
  id: 'properties-markers',
  type: 'circle',
  source: 'properties',
  'source-layer': 'properties',
  paint: {
    'circle-radius': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      12,  // Больше при ховере
      8    // Обычный размер
    ],
    'circle-color': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      '#ef4444',  // Красный при ховере
      '#3b82f6'   // Синий обычный
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      1,    // Полная непрозрачность при ховере
      0.8   // Немного прозрачный обычно
    ],
  },
});
```

---

## Оптимизация

### Кеширование данных кластеров

```typescript
// Кеш для данных кластеров
const clusterCache = new Map<string, {
  properties: Property[];
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 минут

const fetchClusterProperties = async (ids: string[]) => {
  const cacheKey = ids.sort().join(',');
  
  // Проверяем кеш
  const cached = clusterCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.properties;
  }
  
  // Запрашиваем с бекенда
  const response = await fetch('/api/properties/cluster', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  
  const data = await response.json();
  
  // Сохраняем в кеш
  clusterCache.set(cacheKey, {
    properties: data.properties,
    timestamp: Date.now(),
  });
  
  return data.properties;
};
```

### Debounce для ховера

```typescript
const debouncedHover = useDebouncedCallback(
  (property: Property | null) => {
    handlePropertyHover(property);
  },
  100 // 100ms
);
```

---

## Настройки кластеризации на бекенде

### Конфигурация

```typescript
interface ClusterConfig {
  radius: number;                // Радиус кластеризации в пикселях (по умолчанию: 50)
  maxZoom: number;              // Максимальный зум для кластеризации (по умолчанию: 14)
  minPoints: number;            // Минимум объектов для формирования кластера (по умолчанию: 2)
  extent: number;               // Размер тайла (по умолчанию: 512)
  nodeSize: number;             // Размер узла дерева (по умолчанию: 64)
}
```

### Алгоритм кластеризации

**Используется:** Supercluster (или аналог)

**Параметры по умолчанию:**

```typescript
const defaultConfig: ClusterConfig = {
  radius: 50,
  maxZoom: 14,
  minPoints: 2,
  extent: 512,
  nodeSize: 64,
};
```

**Генерация PBF tiles с кластерами:**

1. Получить все объекты, соответствующие фильтрам
2. Преобразовать в GeoJSON points
3. Кластеризовать с помощью Supercluster
4. Сгенерировать MVT для запрошенного тайла (z/x/y)
5. Вернуть PBF с двумя слоями: `properties` и `clusters`

---

## Мониторинг и аналитика

**События:**

```typescript
enum ClusterEvent {
  CLICK = 'cluster.click',
  DOUBLE_CLICK = 'cluster.double_click',
  HOVER = 'cluster.hover',
  EXPAND = 'cluster.expand',
  RESET = 'cluster.reset',
}
```

**Метрики:**

- Количество кликов по кластерам
- Среднее количество объектов в просматриваемых кластерах
- Частота использования зума к кластеру vs отображения в сайдбаре
- Время просмотра объектов кластера

---

## Примеры использования

### Пример 1: Клик по кластеру и отображение в сайдбаре

```typescript
const handleClusterClick = async (clusterId: string) => {
  // 1. Показываем loader
  setSidebarLoading(true);
  
  // 2. Получаем IDs объектов
  const source = map.getSource('properties');
  const propertyIds = await getClusterLeaves(source, clusterId);
  
  // 3. Запрашиваем данные
  const { properties, cluster } = await fetchClusterProperties(propertyIds);
  
  // 4. Отображаем в сайдбаре
  setSidebarMode('cluster');
  setClusterProperties(properties);
  setActiveCluster(cluster);
  setSidebarLoading(false);
  
  // 5. Трекинг
  trackEvent(ClusterEvent.CLICK, {
    clusterId,
    pointCount: cluster.pointCount,
  });
};
```

### Пример 2: Зум к кластеру при двойном клике

```typescript
const handleClusterDoubleClick = async (
  clusterId: string,
  coordinates: [number, number]
) => {
  // 1. Получаем зум распада
  const { expansionZoom } = await fetchExpansionZoom(clusterId);
  
  // 2. Анимированный зум
  map.easeTo({
    center: coordinates,
    zoom: expansionZoom,
    duration: 500,
    easing: (t) => t * (2 - t), // ease-out quad
  });
  
  // 3. Трекинг
  trackEvent(ClusterEvent.EXPAND, {
    clusterId,
    fromZoom: map.getZoom(),
    toZoom: expansionZoom,
  });
};
```

### Пример 3: Отображение статистики в тултипе

```typescript
const ClusterTooltip: FC<{ stats: ClusterStats }> = ({ stats }) => {
  return (
    <div className="cluster-tooltip p-3 bg-background-secondary rounded-lg shadow-lg">
      <div className="font-semibold text-lg mb-2">
        {stats.pointCount} объектов
      </div>
      
      <div className="space-y-1 text-sm">
        <div>
          <span className="text-text-secondary">Цена:</span>{' '}
          {formatPrice(stats.priceRange.min)} -{' '}
          {formatPrice(stats.priceRange.max)}
        </div>
        
        <div>
          <span className="text-text-secondary">Средняя:</span>{' '}
          {formatPrice(stats.priceRange.avg)}
        </div>
        
        <div>
          <span className="text-text-secondary">Площадь:</span>{' '}
          {stats.areaRange.min} - {stats.areaRange.max} м²
        </div>
      </div>
      
      {stats.categoryDistribution.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-text-secondary mb-1">Категории:</div>
          {stats.categoryDistribution.map(({ category, percentage }) => (
            <div key={category} className="text-xs">
              {getCategoryLabel(category)}: {percentage.toFixed(0)}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```
