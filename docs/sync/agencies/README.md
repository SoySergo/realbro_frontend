# Агентства недвижимости — Документация для синхронизации с бекендом

## Обзор

Система работы с агентствами недвижимости поддерживает:
1. **Детальная страница агентства** — `/[locale]/agency/[id]`
2. **Список агентств** — `/[locale]/agencies`
3. **Объекты агентства с фильтрацией**
4. **Команда агентов**
5. **Отзывы об агентстве**

---

## Типы данных

### Agency (Основной тип агентства)

\`\`\`typescript
interface Agency {
  // Основная информация
  id: string;
  name: string;
  slug: string; // URL-friendly идентификатор
  
  // Визуальные элементы
  logo?: string;              // URL логотипа
  coverImage?: string;        // Фоновое изображение
  images?: string[];          // Фото офиса, команды
  
  // Описание
  description: string;
  descriptionShort?: string;
  
  // Контакты и офисы
  contact: AgencyContact;
  offices: AgencyOffice[];
  
  // Характеристики
  languages: string[];        // ['es', 'en', 'ru', etc.]
  propertyTypes: AgencyPropertyType[];
  serviceTypes: AgencyServiceType[];
  
  // Статистика
  objectsCount: number;       // Общее количество объектов
  rentalsCount?: number;      // Объектов в аренде
  salesCount?: number;        // Объектов на продажу
  agentsCount?: number;       // Количество агентов
  reviewsCount: number;
  rating: number;             // 1-5
  
  // Верификация и статусы
  isVerified?: boolean;
  isPremium?: boolean;
  
  // История
  foundedYear?: number;
  yearsOnPlatform?: number;
  
  // Мета
  createdAt: Date;
  updatedAt: Date;
  
  // Связанные данные (опционально подгружаются)
  agents?: AgencyAgent[];
  reviews?: AgencyReview[];
}
\`\`\`

### Вложенные типы

\`\`\`typescript
// Типы недвижимости, с которыми работает агентство
type AgencyPropertyType =
  | 'residential'    // Жилая недвижимость
  | 'commercial'     // Коммерческая
  | 'luxury'         // Премиум/Люкс
  | 'newBuilding'    // Новостройки
  | 'secondary'      // Вторичный рынок
  | 'rental'         // Аренда
  | 'sale';          // Продажа

// Типы услуг
type AgencyServiceType =
  | 'rental'         // Аренда
  | 'sale'           // Продажа
  | 'management'     // Управление недвижимостью
  | 'consulting'     // Консалтинг
  | 'legal'          // Юридические услуги
  | 'valuation';     // Оценка недвижимости

// Контактные данные
interface AgencyContact {
  phone: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  telegram?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

// Офис агентства
interface AgencyOffice {
  id: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  isMain?: boolean;
  workingHours?: WorkingHours;
}

// Агент в агентстве
interface AgencyAgent {
  id: string;
  name: string;
  avatar?: string;
  position?: string;         // Должность
  phone?: string;
  email?: string;
  languages: string[];
  specialization?: AgencyPropertyType[];
  objectsCount?: number;     // Количество объектов агента
  isVerified?: boolean;
}
\`\`\`

---

## API Endpoints

### 1. Получение агентства по ID

**Endpoint:** \`GET /api/agencies/:id\`

**Query параметры:**

\`\`\`typescript
interface AgencyByIdRequest {
  lang?: string; // 'ru', 'en', 'es', 'ca', 'fr', 'it', 'pt', 'de'
}
\`\`\`

**Response:**

\`\`\`typescript
interface AgencyByIdResponse {
  success: true;
  data: Agency;
  meta: {
    timestamp: string;
    requestId: string;
  };
}
\`\`\`

**Пример запроса:**

\`\`\`
GET /api/agencies/agency_1?lang=ru
\`\`\`

---

### 2. Получение объектов агентства с фильтрами

**Endpoint:** \`GET /api/agencies/:id/properties\`

**Query параметры:**

\`\`\`typescript
interface AgencyPropertiesRequest {
  // Пагинация
  page?: number;          // Номер страницы (начиная с 1)
  limit?: number;         // Объектов на странице (по умолчанию: 12, max: 100)
  
  // Фильтры
  minPrice?: number;      // Минимальная цена
  maxPrice?: number;      // Максимальная цена
  rooms?: string;         // Комнаты через запятую: "1,2,3"
  minArea?: number;       // Минимальная площадь
  maxArea?: number;       // Максимальная площадь
  propertyCategory?: string; // Типы недвижимости: "apartment,house"
  agentId?: string;       // Фильтр по конкретному агенту
  
  // Сортировка
  sort?: 'price' | 'area' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  
  // Язык
  lang?: string;
}
\`\`\`

**Response:**

\`\`\`typescript
interface AgencyPropertiesResponse {
  success: true;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
\`\`\`

**Пример запроса:**

\`\`\`
GET /api/agencies/agency_1/properties?
  page=1&
  limit=12&
  minPrice=500&
  maxPrice=2000&
  rooms=2,3&
  agentId=agent_5&
  sort=price&
  sortOrder=asc&
  lang=ru
\`\`\`

---

## SEO и кеширование

### ISR (Incremental Static Regeneration)

\`\`\`typescript
// В Next.js page
export const revalidate = 3600; // 1 час для детальной страницы
\`\`\`

### Метаданные для SEO

\`\`\`typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const agency = await getAgencyById(id, locale);

  if (!agency) {
    return { title: 'Agency Not Found' };
  }

  return {
    title: \`\${agency.name} - Агентство недвижимости\`,
    description: agency.descriptionShort || agency.description.substring(0, 160),
    keywords: [
      agency.name,
      'агентство недвижимости',
      ...agency.languages,
      ...agency.propertyTypes,
    ].join(', '),
    openGraph: {
      title: agency.name,
      description: agency.descriptionShort,
      images: agency.logo ? [agency.logo] : [],
      type: 'website',
      locale: locale,
    },
  };
}
\`\`\`

---

## Миграция с моков на реальный API

### Переключение режима

\`\`\`typescript
// .env или .env.local
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
\`\`\`

### API клиент

\`\`\`typescript
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getAgencyById(id: string, locale: string): Promise<Agency | null> {
  if (USE_MOCKS) {
    return generateMockAgency(index, { locale, includeAgents: true });
  }

  const response = await fetch(\`\${API_BASE}/agencies/\${id}?lang=\${locale}\`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return await response.json();
}
\`\`\`

---

## Примечания

1. **Все даты в ISO 8601 формате** (с timezone)
2. **Координаты в формате { lat, lng }**
3. **Slug используется для SEO-friendly URLs** (опционально)
4. **Images массив всегда содержит URL** (без локальных путей)
5. **Phone в международном формате** (+34 xxx xxx xxx)
6. **Rating всегда от 1 до 5** (с плавающей точкой)
