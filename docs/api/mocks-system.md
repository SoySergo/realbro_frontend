# Централизованная система моков для недвижимости

## Обзор

Система централизованных моков позволяет генерировать тестовые данные недвижимости с единообразной структурой и легко переключаться между моками и реальным API.

## Расположение файлов

```
src/shared/api/mocks/
├── index.ts                  # Экспорт всех моков
├── properties-mock.ts        # Централизованная генерация моков
└── property-detail/          # Моки для детальной информации
```

## Использование

### Базовая генерация

```typescript
import { generateMockProperty, generateMockProperties } from '@/shared/api/mocks';

// Генерация одного объекта
const property = generateMockProperty(0);

// Генерация списка
const properties = generateMockProperties(10);
```

### Конфигурация моков

```typescript
interface MockPropertyConfig {
    // Базовые настройки
    locale?: 'en' | 'ru' | 'es' | 'ca' | 'fr' | 'it' | 'pt' | 'de' | 'uk';
    currency?: 'EUR' | 'USD' | 'RUB';
    
    // Контроль данных
    includeAuthor?: boolean;
    includeTransport?: boolean;
    includeRentalConditions?: boolean;
    includeTenantPreferences?: boolean;
    includeBuilding?: boolean;
    includeRoommates?: boolean;
    
    // Тип карточки (влияет на обязательные поля)
    cardType?: 'grid' | 'horizontal' | 'sidebar' | 'detail';
}
```

### Примеры использования

#### 1. Grid карточки (листинг)

```typescript
const properties = generateMockProperties(20, {
    cardType: 'grid',
    includeAuthor: true,
    includeTransport: true
});
```

**Включает:**
- title, type, price, pricePerMeter
- rooms, area, floor, totalFloors
- address, city, coordinates
- images (полная коллекция)
- nearbyTransport (если includeTransport: true)
- author (если includeAuthor: true)
- createdAt, isNew, isVerified

#### 2. Horizontal карточки (чат, расширенный список)

```typescript
const property = generateMockProperty(0, {
    cardType: 'horizontal',
    includeAuthor: true,
    includeTransport: true,
    locale: 'ru'
});
```

**Включает все из Grid +:**
- livingArea, kitchenArea, ceilingHeight
- Более детальное description на выбранном языке

#### 3. Sidebar карточки (для карты)

```typescript
const property = generateMockProperty(0, {
    cardType: 'sidebar'
});
```

**Включает минимальный набор:**
- title, type, price, rooms, area
- address, coordinates (обязательно)
- images[0] (только первое изображение)

#### 4. Detail карточки (полная информация)

```typescript
const property = generateMockProperty(0, {
    cardType: 'detail',
    locale: 'ru',
    includeAuthor: true,
    includeTransport: true,
    includeRentalConditions: true,
    includeTenantPreferences: true,
    includeBuilding: true,
    includeRoommates: true
});
```

**Включает все поля модели Property:**
- Полное description
- rentalConditions, tenantPreferences
- building, roommates
- amenities, video, tour3d, floorPlan

### Пагинация

```typescript
import { generateMockPropertiesPage } from '@/shared/api/mocks';

const result = generateMockPropertiesPage(
    1,      // page
    20,     // limit
    500,    // total
    {
        cardType: 'grid',
        includeAuthor: true
    }
);

// result = {
//     data: Property[],
//     pagination: {
//         page: 1,
//         limit: 20,
//         total: 500,
//         totalPages: 25
//     }
// }
```

### Генерация для кластеров

```typescript
import { generateMockClusterProperties } from '@/shared/api/mocks';

// Для конкретного кластера на карте
const clusterProperties = generateMockClusterProperties(
    'cluster_xyz',  // clusterId
    5,              // count
    { cardType: 'sidebar' }
);
```

## Feature Flags

### Конфигурация

```typescript
// src/shared/config/features.ts
export const FEATURES = {
    USE_MOCK_PROPERTIES: 
        process.env.NEXT_PUBLIC_USE_MOCK_PROPERTIES === 'true' || 
        process.env.NODE_ENV === 'development',
};
```

### Использование в API

```typescript
import { FEATURES } from '@/shared/config/features';
import { generateMockPropertiesPage } from '@/shared/api/mocks';

export async function getPropertiesList(params: PropertiesListParams) {
    try {
        // Попытка получить данные с реального API
        const response = await fetch(...);
        return response.json();
    } catch (error) {
        console.error('[API] Failed to get properties list:', error);
        
        // Fallback к мокам в development
        if (FEATURES.USE_MOCK_PROPERTIES) {
            return generateMockPropertiesPage(
                params.page, 
                params.limit, 
                500, 
                {
                    cardType: 'grid',
                    includeAuthor: true,
                    includeTransport: true
                }
            );
        }
        
        throw error;
    }
}
```

## Переменные окружения

```env
# .env.local

# Использовать моки (по умолчанию true в development)
NEXT_PUBLIC_USE_MOCK_PROPERTIES=true
```

## Локализация

Система поддерживает генерацию описаний на разных языках:

```typescript
const propertyRu = generateMockProperty(0, { locale: 'ru' });
// description: "Просторная квартира в самом сердце Барселоны..."

const propertyEn = generateMockProperty(0, { locale: 'en' });
// description: "Spacious apartment in the heart of Barcelona..."

const propertyEs = generateMockProperty(0, { locale: 'es' });
// description: "Amplio apartamento en el corazón de Barcelona..."
```

**Поддерживаемые локали:**
- `ru` - Русский (по умолчанию)
- `en` - English
- `es` - Español
- `ca` - Català
- `fr` - Français

## Данные для моков

### Локации (Барселона)

14 районов и 10 улиц для реалистичных адресов

### Авторы

5 предопределенных авторов с разными типами (agent, owner, agency)

### Транспорт

10+ станций метро, поезда и автобуса с линиями и временем ходьбы

### Изображения

5 коллекций по 6 качественных изображений интерьеров от Unsplash

## Переключение на реальный API

Когда backend будет готов:

1. **Убрать fallback в catch блоках** или
2. **Изменить feature flag:**
   ```env
   NEXT_PUBLIC_USE_MOCK_PROPERTIES=false
   ```

Код компонентов не нужно менять!

## Преимущества

✅ **Единый источник правды** - все моки из одного места  
✅ **Консистентность данных** - одинаковая структура везде  
✅ **Гибкая конфигурация** - легко настроить для разных случаев  
✅ **Локализация** - поддержка нескольких языков  
✅ **Легкое переключение** - простой переход на реальный API  
✅ **Типобезопасность** - полная поддержка TypeScript
