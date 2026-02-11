# Компоненты профиля — Руководство разработчика

## Обзор

Страница профиля реализована как набор табов с различными настройками пользователя. Все компоненты следуют FSD архитектуре и находятся в слое `widgets/profile`.

## Структура компонентов

```
src/widgets/profile/
├── profile-widget.tsx              # Основной виджет с табами
└── tabs/
    ├── profile-general-tab.tsx     # Личная информация
    ├── profile-subscription-tab.tsx # Подписки и платежи
    ├── profile-notifications-tab.tsx # Настройки уведомлений
    ├── profile-security-tab.tsx    # Безопасность
    └── profile-appearance-tab.tsx  # Оформление
```

---

## ProfileWidget

**Путь:** `src/widgets/profile/profile-widget.tsx`

**Назначение:** Основной виджет профиля с табами. Загружает данные профиля и отображает разные секции настроек.

**Функционал:**
- Загрузка данных профиля через `getProfilePageData()`
- Табы: General, Subscription, Notifications, Security, Appearance
- Состояния загрузки и ошибок
- Рефреш данных после обновлений

**Используемые API:**
- `getProfilePageData()` - батч получение всех данных

**Оптимизация:**
- Загрузка происходит один раз при монтировании
- Рефреш вызывается только при явном обновлении

---

## Полезные ссылки

- [API документация](../../../backend-integration/profile-api.md)
- [Типы данных](../../../../src/entities/user/model/types.ts)
- [Валидация схемы](../../../../src/entities/user/model/validation.ts)
- [RULES.md](../../../migrate_sidebar/RULES.md) - общие правила разработки
