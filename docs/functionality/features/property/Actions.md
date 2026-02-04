# Действия с объектом недвижимости

## Обзор

Система действий пользователя с объектами: лайки, дизлайки, заметки, шаринг, жалобы.

## Компоненты

### PropertyActionsMenu

**Что делает**: Меню действий с объектом (лайк, дизлайк, заметка, поделиться).

**Ключевые особенности**:
- Три варианта отображения: `inline`, `compact`, `full`
- Анимации при взаимодействии
- Тосты с уведомлениями
- Сохранение состояния в localStorage

**Props**:
```typescript
interface Props {
    propertyId: string;
    propertyTitle?: string;
    translations: PropertyActionsMenuTranslations;
    variant?: 'inline' | 'compact' | 'full';
    isLiked?: boolean;
    isDisliked?: boolean;
    hasNote?: boolean;
    onLike?: (propertyId, isLiked) => void;
    onDislike?: (propertyId, isDisliked) => void;
    onShare?: (propertyId) => void;
    onReport?: (propertyId) => void;
}
```

**Файл**: `src/features/property-actions/ui/actions-menu.tsx`

### NoteModal

**Что делает**: Модалка для добавления/редактирования заметок к объекту.

**Ключевые особенности**:
- Максимальная длина 500 символов
- Счетчик символов
- Сохранение по Ctrl+Enter
- Хранение в localStorage

**Файл**: `src/features/property-actions/ui/note-modal.tsx`

## Хранение данных

### Реакции (лайки/дизлайки)
```javascript
localStorage.setItem('realbro_property_reactions', JSON.stringify({
    [propertyId]: { liked: boolean, disliked: boolean, updatedAt: string }
}));
```

### Заметки
```javascript
localStorage.setItem('realbro_property_notes', JSON.stringify({
    [propertyId]: { note: string, updatedAt: string }
}));
```

## Тосты

Используется `useToast()` из `@/shared/ui/toast`:

```tsx
import { useToast } from '@/shared/ui/toast';

const { showToast } = useToast();
showToast('Ссылка скопирована', 'success');
showToast('Добавлено в избранное', 'success');
```

## Локализация

Переводы в `messages/{locale}.json`:
```json
{
  "actions": {
    "like": "Нравится",
    "liked": "Добавлено в избранное",
    "copyLink": "Скопировать ссылку",
    "linkCopied": "Ссылка скопирована",
    "noteModal": {
      "title": "Заметка",
      "placeholder": "Напишите заметку..."
    }
  }
}
```

## Использование

```tsx
import { PropertyActionsMenu } from '@/features/property-actions';

<PropertyActionsMenu
    propertyId={property.id}
    propertyTitle={property.title}
    translations={actionsTranslations}
    variant="inline"
    onLike={(id, isLiked) => console.log('Like', id, isLiked)}
    onDislike={(id, isDisliked) => console.log('Dislike', id, isDisliked)}
/>
```

## Dropdown меню

В `inline` и `compact` вариантах доступно дополнительное меню:
- Скопировать ссылку
- Скачать PDF
- Пожаловаться

Меню реализовано через `@/shared/ui/dropdown-menu`.
