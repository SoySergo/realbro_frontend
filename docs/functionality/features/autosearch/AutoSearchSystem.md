# AutoSearch System

**Назначение**: Система автоматической подборки объектов недвижимости с поддержкой множественных каналов уведомлений и гибким расписанием (quiet hours).

## Обзор

AutoSearch - это автономная система, отделённая от чата, которая позволяет пользователям создавать задания для автоматического поиска объектов недвижимости на основе сохранённых фильтров.

### Ключевые особенности

- **Множественные каналы уведомлений**: online (WebSocket), Telegram, Push, Email
- **Гибкая частота**: instant (мгновенно), daily (раз в день), weekly (раз в неделю)
- **Quiet Hours**: настройка временного окна для получения уведомлений
- **Timezone support**: автоопределение и ручной выбор часового пояса
- **Real-time feed**: лента входящих объектов через WebSocket

## Файлы и Компоненты

### Типы
- `src/entities/autosearch/model/types.ts`

### Store
- `src/features/autosearch/model/store.ts`

### API
- `src/shared/api/autosearch.ts`

### WebSocket
- `src/shared/hooks/use-autosearch-websocket.ts`

### UI
- `src/features/autosearch/ui/autosearch-task-card.tsx`
- `src/features/autosearch/ui/autosearch-task-list.tsx`
- `src/features/autosearch/ui/autosearch-property-feed.tsx`

### Локализация
- `messages/{ru,en,es}.json` - секция `autosearch`

## Каналы уведомлений

### Online (WebSocket)
Мгновенные уведомления для онлайн пользователей через канал `autosearch:user_{userId}`

### Telegram / Push / Email
Уведомления для офлайн пользователей с учётом quiet hours:
- Внутри окна: отправка согласно frequency
- Вне окна: накопление и дайджест

## Статус

✅ Выполнено: типы, API, store, WebSocket, UI компоненты, локализация (ru, en, es)
⏳ TODO: форма создания, mock API, интеграция в Chat Layout

См. полную документацию выше для деталей.
