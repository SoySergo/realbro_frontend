# Контакты недвижимости

## Обзор

Система отображения контактов владельцев/агентов объектов недвижимости с проверкой авторизации и тарифных лимитов.

## Компоненты

### ContactModal

**Что делает**: Модальное окно для отображения контактов с проверкой прав доступа.

**Ключевые особенности**:
- Проверяет авторизацию пользователя
- Проверяет тарифные лимиты через API
- Адаптивный дизайн (телефон vs ПК)
- Кэширование просмотренных контактов в localStorage

**Файл**: `src/features/property-contact/ui/contact-modal.tsx`

### useContactStore

**Что делает**: Zustand store для управления состоянием модалки контактов.

**API**:
```typescript
const { 
    isOpen,           // boolean - открыта ли модалка
    contacts,         // ContactInfo | null - контакты
    error,            // ContactAccessError | null - ошибка
    openContactModal, // (params) => void - открыть модалку
    closeContactModal,// () => void - закрыть
    requestContacts,  // (isAuth, tariff) => Promise - запросить контакты
} = useContactStore();
```

**Файл**: `src/features/property-contact/model/store.ts`

## API Контактов

### getContactAccess

**Что делает**: Запрос контактов с проверкой авторизации и лимитов.

**Параметры**:
- `propertyId` - ID объекта
- `authorId` - ID автора (владелец/агент)
- `authorType` - тип автора: 'owner' | 'agent' | 'agency'
- `options.isAuthenticated` - авторизован ли пользователь
- `options.userTariff` - тариф: 'free' | 'standard' | 'maximum'

**Возвращает**:
```typescript
{
    success: boolean;
    contacts?: { phone, whatsapp, telegram, email, website };
    error?: 'auth_required' | 'limit_exceeded' | 'subscription_required';
    limit?: { current, max, resetAt };
}
```

**Файл**: `src/shared/api/contacts.ts`

## Логика работы

### Для неавторизованных:
1. **Владельцы**: требуется авторизация
2. **Агентства**: до 5 просмотров в localStorage

### Для авторизованных (бесплатный тариф):
- Владельцы: 5/день
- Агенты: 10/день
- Агентства: 20/день

### Кэширование:
Просмотренные контакты сохраняются в localStorage и показываются без повторного запроса.

## Локализация

Переводы в `messages/{locale}.json`:
```json
{
  "contact": {
    "title": "Контакты",
    "authRequiredTitle": "Требуется авторизация",
    "limitExceededTitle": "Лимит исчерпан",
    // ...
  }
}
```

## Использование

```tsx
import { ContactModal, useContactStore } from '@/features/property-contact';

// В компоненте
const { openContactModal } = useContactStore();

const handleContact = () => {
    openContactModal({
        propertyId: property.id,
        authorId: property.author.id,
        authorType: property.author.type,
        authorName: property.author.name,
    });
};

// В layout/page добавить модалку
<ContactModal translations={contactTranslations} />
```
