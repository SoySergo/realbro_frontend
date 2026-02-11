# User Actions Entity

Централизованная система управления действиями пользователя с объектами недвижимости.

## Описание

Эта entity предоставляет единый интерфейс для работы с:
- **Лайками** (нравится)
- **Дизлайками** (не нравится)
- **Заметками** (персональные заметки к объектам)

## Архитектура

```
src/entities/user-actions/
├── model/
│   ├── types.ts          # TypeScript типы
│   ├── store.ts          # Zustand store с localStorage persist
│   └── index.ts
├── api/
│   ├── client.ts         # API клиент для синхронизации с бекендом
│   └── index.ts
├── lib/
│   ├── hooks.ts          # React хуки
│   └── index.ts
├── index.ts              # Главный экспорт
└── README.md            # Этот файл
```

## Использование

### Базовое использование

```typescript
import { usePropertyActions } from '@/entities/user-actions';

function PropertyCard({ property }) {
  const { isLiked, isDisliked, hasNote, toggleLike, toggleDislike, saveNote } = 
    usePropertyActions(property.id);
  
  return (
    <div>
      <h2>{property.title}</h2>
      
      <button onClick={toggleLike}>
        {isLiked ? '❤️ Liked' : '🤍 Like'}
      </button>
      
      <button onClick={toggleDislike}>
        {isDisliked ? '👎 Disliked' : '👎 Dislike'}
      </button>
      
      <button onClick={() => saveNote('Great property!')}>
        {hasNote ? '📝 Edit Note' : '📝 Add Note'}
      </button>
    </div>
  );
}
```

### Массовые операции

```typescript
import { useUserActionsBulk } from '@/entities/user-actions';

function SyncManager() {
  const { reactions, notes, isLoading, isSyncing, setReactions, setNotes } = 
    useUserActionsBulk();
  
  // Синхронизация с сервером
  const syncWithServer = async () => {
    const serverData = await fetchFromServer();
    setReactions(serverData.reactions);
    setNotes(serverData.notes);
  };
  
  return (
    <button onClick={syncWithServer} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : 'Sync'}
    </button>
  );
}
```

### Прямой доступ к store

```typescript
import { useUserActionsStore } from '@/entities/user-actions';

function MyComponent() {
  // Получить состояние
  const isLiked = useUserActionsStore(state => state.hasLike('property_123'));
  
  // Вызвать action
  const setReaction = useUserActionsStore(state => state.setReaction);
  
  return (
    <button onClick={() => setReaction('property_123', 'like')}>
      Like
    </button>
  );
}
```

## API

### usePropertyActions(propertyId: string)

Основной хук для работы с действиями на конкретный объект.

**Возвращает:**
```typescript
{
  // Состояние
  reaction: 'like' | 'dislike' | null;
  note: string | null;
  isLiked: boolean;
  isDisliked: boolean;
  hasNote: boolean;
  
  // Действия
  toggleLike: () => Promise<void>;
  toggleDislike: () => Promise<void>;
  saveNote: (text: string) => Promise<void>;
  removeNote: () => Promise<void>;
}
```

**Особенности:**
- Оптимистичные обновления (UI обновляется сразу)
- Автоматическая синхронизация с бекендом
- Откат изменений при ошибке

### useUserActionsBulk()

Хук для массовых операций с данными.

**Возвращает:**
```typescript
{
  // Состояние
  reactions: StoredReactions;
  notes: StoredNotes;
  isLoading: boolean;
  isSyncing: boolean;
  
  // Массовые операции
  setReactions: (reactions: StoredReactions) => void;
  setNotes: (notes: StoredNotes) => void;
  clearAll: () => void;
  
  // Служебные методы
  setLoading: (isLoading: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
}
```

## Типы данных

### PropertyReaction

```typescript
type PropertyReaction = 'like' | 'dislike' | null;
```

### StoredReactions

```typescript
interface StoredReactions {
  [propertyId: string]: {
    reaction: PropertyReaction;
    updatedAt: string; // ISO 8601
  };
}
```

### StoredNotes

```typescript
interface StoredNotes {
  [propertyId: string]: {
    text: string;
    updatedAt: string; // ISO 8601
  };
}
```

## Хранение данных

### localStorage

Данные автоматически сохраняются в localStorage через Zustand persist middleware:

**Ключ:** `user-actions-storage`
**Версия:** `1`

### Синхронизация с бекендом

API клиент предоставляет методы для синхронизации:

```typescript
import { 
  setPropertyReaction, 
  setPropertyNote, 
  deletePropertyNote,
  getUserReactions,
  getUserNotes,
  syncUserActions,
} from '@/entities/user-actions/api';

// Установить реакцию
await setPropertyReaction('prop_123', 'like');

// Установить заметку
await setPropertyNote('prop_123', 'Great apartment!');

// Удалить заметку
await deletePropertyNote('prop_123');

// Получить все реакции
const reactions = await getUserReactions();

// Получить все заметки
const notes = await getUserNotes();

// Массовая синхронизация
await syncUserActions(reactions, notes);
```

## Интеграция

### Существующие компоненты

Следующие компоненты уже интегрированы:

1. **GlobalToastProvider** - тосты уведомлений
2. **PropertyActionsMenu** - меню действий в деталях объекта
3. **PropertyDetailWidget** - виджет деталей объекта

### Добавление в новый компонент

```typescript
'use client';

import { usePropertyActions } from '@/entities/user-actions';

export function MyPropertyCard({ property }) {
  const { isLiked, toggleLike } = usePropertyActions(property.id);
  
  return (
    <div>
      <h3>{property.title}</h3>
      <button onClick={toggleLike}>
        {isLiked ? 'Unlike' : 'Like'}
      </button>
    </div>
  );
}
```

## Тестирование

### Мокирование store

```typescript
import { useUserActionsStore } from '@/entities/user-actions';

// В тестах
beforeEach(() => {
  useUserActionsStore.setState({
    reactions: {},
    notes: {},
    isLoading: false,
    isSyncing: false,
  });
});
```

### Мокирование API

API методы пока возвращают мок-данные (бекенд в разработке):

```typescript
// src/entities/user-actions/api/client.ts

// TODO: Раскомментировать когда бекенд будет готов
/*
const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/reaction`, {
  method: 'POST',
  body: JSON.stringify({ reaction }),
});
*/

// Сейчас возвращается моковый ответ
return { success: true, reaction };
```

## Производительность

### Оптимизации

1. **Zustand persist** - автоматическое сохранение в localStorage с дебаунсингом
2. **Оптимистичные обновления** - UI обновляется мгновенно, запрос в фоне
3. **Мемоизация** - хуки используют useCallback для предотвращения ре-рендеров
4. **Batch операции** - массовая синхронизация вместо множества запросов

### Мониторинг

```typescript
// Отслеживание состояния синхронизации
const { isSyncing } = useUserActionsBulk();

useEffect(() => {
  if (isSyncing) {
    console.log('Syncing user actions...');
  }
}, [isSyncing]);
```

## Документация для бекенда

См. `docs/backend-integration/user-actions.md` для полной документации API endpoints.

## TODO

- [ ] Добавить модалку для создания/редактирования заметок
- [ ] Добавить напоминания к заметкам
- [ ] Добавить экспорт в избранное
- [ ] Добавить фильтрацию объектов по реакциям
- [ ] Интегрировать с рекомендательной системой

## Changelog

### v1.0.0 (2024-02-11)
- Начальная версия
- Базовые операции: like, dislike, note
- Zustand store с localStorage persist
- API клиент с моками
- Хуки usePropertyActions и useUserActionsBulk
- Интеграция с существующими компонентами
