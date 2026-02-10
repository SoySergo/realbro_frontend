# Вкладки поиска (Search Tabs) — Документация для синхронизации с бекендом

## Обзор

Система вкладок позволяет пользователям:
- Сохранять поисковые запросы с фильтрами
- Редактировать сохраненные запросы
- Быстро переключаться между разными поисками
- Синхронизировать вкладки между устройствами

Каждая вкладка представляет собой именованный набор фильтров + состояние отображения (карта/список, сортировка и т.д.).

---

## Типы данных

### SearchTab (Вкладка поиска)

```typescript
interface SearchTab {
  // Идентификация
  id: string;                    // UUID вкладки
  userId: string;                // ID пользователя
  
  // Метаданные
  title: string;                 // Название вкладки (например: "Студии в Барселоне")
  description?: string;          // Описание (опционально)
  icon?: string;                 // Иконка (emoji или lucide icon name)
  color?: string;                // Цветовая метка (#hex)
  
  // Фильтры (см. docs/sync/filters/README.md)
  filters: SearchFiltersRequest;
  
  // Состояние отображения
  viewMode: 'map' | 'list';                // Режим отображения
  listingViewMode?: 'grid' | 'list';      // Режим списка (если viewMode === 'list')
  sort?: 'createdAt' | 'price' | 'area';  // Сортировка
  sortOrder?: 'asc' | 'desc';             // Порядок сортировки
  
  // Карта (если viewMode === 'map')
  mapState?: {
    center: [number, number];    // [lng, lat]
    zoom: number;                // Zoom level (0-18)
    pitch?: number;              // 3D наклон (0-60)
    bearing?: number;            // Поворот (0-360)
  };
  
  // Статус
  isPinned: boolean;             // Закреплена ли вкладка
  isDefault: boolean;            // Вкладка по умолчанию
  
  // Статистика
  resultsCount?: number;         // Количество результатов (кешированное)
  lastUsedAt: Date;              // Последнее использование
  usageCount: number;            // Количество использований
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### TabFolder (Папка для группировки вкладок)

```typescript
interface TabFolder {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  tabIds: string[];              // IDs вкладок в папке
  order: number;                 // Порядок отображения
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. Получение списка вкладок

**Endpoint:** `GET /api/search-tabs`

**Query параметры:**

```typescript
interface GetTabsRequest {
  includeDefault?: boolean;      // Включить системную вкладку по умолчанию
  includeFolders?: boolean;      // Включить папки
}
```

**Response:**

```typescript
interface GetTabsResponse {
  tabs: SearchTab[];
  folders?: TabFolder[];
  defaultTab?: SearchTab;        // Вкладка по умолчанию
}
```

**Пример запроса:**

```
GET /api/search-tabs?includeDefault=true&includeFolders=true
```

---

### 2. Создание вкладки

**Endpoint:** `POST /api/search-tabs`

**Request body:**

```typescript
interface CreateTabRequest {
  title: string;                                // Обязательно
  description?: string;
  icon?: string;
  color?: string;
  filters: SearchFiltersRequest;                // Обязательно
  viewMode: 'map' | 'list';                     // Обязательно
  listingViewMode?: 'grid' | 'list';
  sort?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  mapState?: {
    center: [number, number];
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  isPinned?: boolean;
  folderId?: string;             // ID папки (если добавляется в папку)
}
```

**Response:**

```typescript
interface CreateTabResponse {
  tab: SearchTab;
}
```

**Пример запроса:**

```json
POST /api/search-tabs

{
  "title": "Студии в центре Барселоны",
  "description": "Аренда студий до 1000€ в центральных районах",
  "icon": "home",
  "color": "#3b82f6",
  "filters": {
    "adminLevel8": [123],
    "adminLevel9": [456, 789],
    "propertyCategory": ["studio"],
    "maxPrice": 1000,
    "dealType": "rent"
  },
  "viewMode": "map",
  "sort": "price",
  "sortOrder": "asc",
  "mapState": {
    "center": [2.1734, 41.3851],
    "zoom": 13
  },
  "isPinned": true
}
```

---

### 3. Обновление вкладки

**Endpoint:** `PATCH /api/search-tabs/:id`

**Request body:**

```typescript
interface UpdateTabRequest {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  filters?: SearchFiltersRequest;
  viewMode?: 'map' | 'list';
  listingViewMode?: 'grid' | 'list';
  sort?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  mapState?: {
    center: [number, number];
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  isPinned?: boolean;
  isDefault?: boolean;
  folderId?: string | null;      // null для удаления из папки
}
```

**Response:**

```typescript
interface UpdateTabResponse {
  tab: SearchTab;
}
```

**Пример запроса:**

```json
PATCH /api/search-tabs/tab-123

{
  "title": "Студии до 800€",
  "filters": {
    "maxPrice": 800
  }
}
```

---

### 4. Удаление вкладки

**Endpoint:** `DELETE /api/search-tabs/:id`

**Response:**

```typescript
interface DeleteTabResponse {
  success: boolean;
}
```

---

### 5. Обновление порядка вкладок

**Endpoint:** `POST /api/search-tabs/reorder`

**Request body:**

```typescript
interface ReorderTabsRequest {
  tabIds: string[];              // Новый порядок IDs
}
```

**Response:**

```typescript
interface ReorderTabsResponse {
  success: boolean;
}
```

---

### 6. Создание папки

**Endpoint:** `POST /api/search-tabs/folders`

**Request body:**

```typescript
interface CreateFolderRequest {
  name: string;
  icon?: string;
  color?: string;
  tabIds?: string[];             // IDs вкладок для добавления в папку
}
```

**Response:**

```typescript
interface CreateFolderResponse {
  folder: TabFolder;
}
```

---

### 7. Обновление папки

**Endpoint:** `PATCH /api/search-tabs/folders/:id`

**Request body:**

```typescript
interface UpdateFolderRequest {
  name?: string;
  icon?: string;
  color?: string;
  tabIds?: string[];
}
```

**Response:**

```typescript
interface UpdateFolderResponse {
  folder: TabFolder;
}
```

---

### 8. Удаление папки

**Endpoint:** `DELETE /api/search-tabs/folders/:id`

**Query параметры:**

```typescript
interface DeleteFolderRequest {
  moveTabs?: 'root' | 'delete';  // Что делать с вкладками: переместить в корень или удалить
}
```

**Response:**

```typescript
interface DeleteFolderResponse {
  success: boolean;
}
```

---

### 9. Обновление статистики использования

**Endpoint:** `POST /api/search-tabs/:id/usage`

**Request body:**

```typescript
interface UpdateUsageRequest {
  resultsCount?: number;         // Обновить количество результатов
}
```

**Response:**

```typescript
interface UpdateUsageResponse {
  success: boolean;
  tab: {
    id: string;
    lastUsedAt: Date;
    usageCount: number;
  };
}
```

**Использование:**

- Вызывается при переключении на вкладку
- Обновляет `lastUsedAt` и `usageCount`
- Опционально обновляет `resultsCount` (для отображения в UI)

---

## Состояние на фронтенде

### Zustand Store

```typescript
interface TabsStore {
  // Данные
  tabs: SearchTab[];
  folders: TabFolder[];
  activeTabId: string | null;
  defaultTabId: string | null;
  
  // Actions
  fetchTabs: () => Promise<void>;
  createTab: (data: CreateTabRequest) => Promise<SearchTab>;
  updateTab: (id: string, data: UpdateTabRequest) => Promise<SearchTab>;
  deleteTab: (id: string) => Promise<void>;
  setActiveTab: (id: string) => void;
  reorderTabs: (tabIds: string[]) => Promise<void>;
  
  // Folders
  createFolder: (data: CreateFolderRequest) => Promise<TabFolder>;
  updateFolder: (id: string, data: UpdateFolderRequest) => Promise<TabFolder>;
  deleteFolder: (id: string, moveTabs: 'root' | 'delete') => Promise<void>;
  
  // Helpers
  getTabById: (id: string) => SearchTab | undefined;
  getPinnedTabs: () => SearchTab[];
  getRecentTabs: (limit: number) => SearchTab[];
}
```

**Файл:** `src/features/search-tabs/model/store.ts`

---

## UI Компоненты

### 1. TabsBar (Панель вкладок)

**Desktop:**

```typescript
interface TabsBarProps {
  tabs: SearchTab[];
  activeTabId: string | null;
  onTabClick: (tab: SearchTab) => void;
  onTabEdit: (tab: SearchTab) => void;
  onTabDelete: (tab: SearchTab) => void;
  onCreateTab: () => void;
}
```

**Расположение:**

- Горизонтальная полоса над фильтрами (desktop)
- Свайп-контейнер (mobile)

**Функционал:**

- Отображение закрепленных вкладок
- Dropdown с всеми вкладками
- Кнопка создания новой вкладки
- Drag & Drop для изменения порядка

**Mobile:**

```typescript
interface TabsSheetProps {
  tabs: SearchTab[];
  folders: TabFolder[];
  activeTabId: string | null;
  onTabSelect: (tab: SearchTab) => void;
  onTabEdit: (tab: SearchTab) => void;
  onTabDelete: (tab: SearchTab) => void;
  onCreateTab: () => void;
}
```

**Расположение:**

- Bottom sheet / Drawer
- Открывается по кнопке в хедере

---

### 2. TabEditor (Редактор вкладки)

**Форма создания/редактирования:**

```typescript
interface TabEditorProps {
  tab?: SearchTab;               // Для редактирования (undefined для создания)
  currentFilters: SearchFiltersRequest;
  currentViewMode: 'map' | 'list';
  onSave: (data: CreateTabRequest | UpdateTabRequest) => void;
  onCancel: () => void;
}
```

**Поля формы:**

- Название (обязательно)
- Описание (опционально)
- Иконка (выбор из preset + emoji picker)
- Цвет (color picker)
- Папка (dropdown с папками)
- Закрепить (checkbox)
- Использовать текущие фильтры (по умолчанию: да)
- Сохранить состояние карты (checkbox, для viewMode === 'map')

---

### 3. TabCard (Карточка вкладки)

```typescript
interface TabCardProps {
  tab: SearchTab;
  isActive: boolean;
  isPinned: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}
```

**Отображение:**

- Иконка + название
- Цветовая метка (левая граница)
- Количество результатов (badge)
- Последнее использование (relative time)
- Меню действий (⋮)

---

## Синхронизация состояния

### При загрузке приложения

```typescript
const initTabs = async () => {
  // 1. Загрузить вкладки с бекенда
  const { tabs, defaultTab } = await fetchTabs();
  
  // 2. Проверить URL — есть ли параметры фильтров
  const urlFilters = parseFiltersFromURL();
  
  if (urlFilters && Object.keys(urlFilters).length > 0) {
    // 3. Если в URL есть фильтры — применить их (без вкладки)
    setCurrentFilters(urlFilters);
    setActiveTab(null);
  } else {
    // 4. Если URL пустой — использовать вкладку по умолчанию
    if (defaultTab) {
      setActiveTab(defaultTab.id);
      setCurrentFilters(defaultTab.filters);
      setViewMode(defaultTab.viewMode);
      // ...
    }
  }
};
```

### При переключении вкладки

```typescript
const switchTab = async (tabId: string) => {
  const tab = getTabById(tabId);
  if (!tab) return;
  
  // 1. Применить фильтры вкладки
  setCurrentFilters(tab.filters);
  setViewMode(tab.viewMode);
  setSort(tab.sort, tab.sortOrder);
  
  // 2. Восстановить состояние карты (если viewMode === 'map')
  if (tab.viewMode === 'map' && tab.mapState) {
    map.flyTo({
      center: tab.mapState.center,
      zoom: tab.mapState.zoom,
      pitch: tab.mapState.pitch,
      bearing: tab.mapState.bearing,
    });
  }
  
  // 3. Обновить URL
  updateFiltersInURL(tab.filters);
  
  // 4. Обновить статистику использования
  await updateTabUsage(tabId);
  
  // 5. Установить активную вкладку
  setActiveTab(tabId);
};
```

### При изменении фильтров

```typescript
const handleFiltersChange = (newFilters: SearchFiltersRequest) => {
  // 1. Применить новые фильтры
  setCurrentFilters(newFilters);
  
  // 2. Проверить — есть ли активная вкладка
  if (activeTabId) {
    // 3. Спросить пользователя: обновить вкладку или создать новую?
    showDialog({
      title: 'Фильтры изменены',
      message: 'Хотите обновить текущую вкладку или создать новую?',
      actions: [
        {
          label: 'Обновить',
          onClick: () => updateTab(activeTabId, { filters: newFilters }),
        },
        {
          label: 'Создать новую',
          onClick: () => openTabEditor({ filters: newFilters }),
        },
        {
          label: 'Отмена',
          onClick: () => {},
        },
      ],
    });
  } else {
    // 4. Если нет активной вкладки — просто применить фильтры
    updateFiltersInURL(newFilters);
  }
};
```

---

## Оптимизация

### Дебаунс автосохранения

```typescript
const debouncedAutoSave = useDebouncedCallback(
  async (tabId: string, filters: SearchFiltersRequest) => {
    await updateTab(tabId, { filters });
  },
  2000 // 2 секунды
);
```

### Кеширование количества результатов

```typescript
const updateTabResultsCount = async (tabId: string) => {
  const tab = getTabById(tabId);
  if (!tab) return;
  
  const { count } = await fetchPropertiesCount(tab.filters);
  
  await updateTab(tabId, { resultsCount: count });
};
```

**Обновление:**

- При создании вкладки
- При переключении на вкладку (если count устарел)
- Периодически в фоне (для часто используемых вкладок)

---

## Импорт/Экспорт вкладок

### Экспорт

**Endpoint:** `GET /api/search-tabs/export`

**Response:**

```typescript
interface ExportTabsResponse {
  version: string;               // Версия формата (для совместимости)
  exportedAt: Date;
  tabs: SearchTab[];
  folders: TabFolder[];
}
```

**Формат файла:** JSON

### Импорт

**Endpoint:** `POST /api/search-tabs/import`

**Request body:**

```typescript
interface ImportTabsRequest {
  data: ExportTabsResponse;
  mode: 'merge' | 'replace';     // merge: добавить к существующим, replace: заменить все
}
```

**Response:**

```typescript
interface ImportTabsResponse {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors?: string[];
}
```

---

## Шаблоны вкладок

### Системные шаблоны

**Endpoint:** `GET /api/search-tabs/templates`

**Response:**

```typescript
interface GetTemplatesResponse {
  templates: TabTemplate[];
}

interface TabTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  filters: SearchFiltersRequest;
  category: 'popular' | 'students' | 'families' | 'professionals';
}
```

**Примеры шаблонов:**

1. **Студии до 1000€** — для студентов
2. **Семейные квартиры 3-4 комнаты** — для семей
3. **Дома с садом** — для любителей природы
4. **Офисы в центре** — для бизнеса

---

## Уведомления о новых объектах

### Подписка на вкладку

**Endpoint:** `POST /api/search-tabs/:id/subscribe`

**Request body:**

```typescript
interface SubscribeRequest {
  notificationChannels: ('email' | 'push' | 'sms')[];
  frequency: 'instant' | 'daily' | 'weekly';
}
```

**Response:**

```typescript
interface SubscribeResponse {
  success: boolean;
  subscription: {
    id: string;
    tabId: string;
    channels: string[];
    frequency: string;
    isActive: boolean;
  };
}
```

### Отписка

**Endpoint:** `DELETE /api/search-tabs/:id/subscribe`

---

## Аналитика

**События для трекинга:**

```typescript
enum TabEvent {
  CREATE = 'tab.create',
  UPDATE = 'tab.update',
  DELETE = 'tab.delete',
  SWITCH = 'tab.switch',
  PIN = 'tab.pin',
  UNPIN = 'tab.unpin',
  EXPORT = 'tab.export',
  IMPORT = 'tab.import',
}
```

**Метрики:**

- Количество созданных вкладок на пользователя
- Средняя частота переключений
- Самые популярные фильтры в вкладках
- Количество закрепленных вкладок

---

## Ограничения

### Лимиты

```typescript
interface TabLimits {
  maxTabsPerUser: 50;            // Максимум вкладок
  maxFoldersPerUser: 10;         // Максимум папок
  maxTabsPerFolder: 20;          // Максимум вкладок в папке
  maxPinnedTabs: 5;              // Максимум закрепленных вкладок
  titleMaxLength: 100;           // Максимальная длина названия
  descriptionMaxLength: 500;     // Максимальная длина описания
}
```

### Валидация

```typescript
const validateTab = (data: CreateTabRequest | UpdateTabRequest) => {
  if (data.title && data.title.length > 100) {
    throw new Error('Title too long');
  }
  
  if (data.description && data.description.length > 500) {
    throw new Error('Description too long');
  }
  
  // ...
};
```

---

## Примеры использования

### Создание вкладки с текущими фильтрами

```typescript
const saveCurrentSearch = async () => {
  const currentFilters = useCurrentFilters();
  const viewMode = useViewMode();
  const mapState = map.getCenter() && {
    center: [map.getCenter().lng, map.getCenter().lat],
    zoom: map.getZoom(),
  };
  
  const tab = await createTab({
    title: 'Мой поиск',
    filters: currentFilters,
    viewMode,
    mapState,
    isPinned: true,
  });
  
  showToast('Вкладка создана', 'success');
  setActiveTab(tab.id);
};
```

### Быстрое переключение между вкладками

```typescript
const QuickTabSwitcher = () => {
  const { tabs, activeTabId, switchTab } = useTabsStore();
  const pinnedTabs = tabs.filter(t => t.isPinned);
  
  return (
    <div className="flex gap-2">
      {pinnedTabs.map(tab => (
        <Button
          key={tab.id}
          variant={activeTabId === tab.id ? 'default' : 'outline'}
          onClick={() => switchTab(tab.id)}
        >
          <span className="text-xl mr-2">{tab.icon}</span>
          {tab.title}
        </Button>
      ))}
    </div>
  );
};
```
