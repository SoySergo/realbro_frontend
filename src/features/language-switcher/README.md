# Language Switcher Feature

## Описание

Feature для переключения языка интерфейса приложения. Поддерживает русский, английский и французский языки.

## Структура

```
language-switcher/
├── model/
│   ├── use-language-switcher.ts    # Hook для управления языком
│   └── index.ts
├── ui/
│   ├── ui.tsx                       # UI компонент переключателя
│   └── index.ts
└── index.ts
```

## Использование

### В компонентах

```tsx
import { LanguageSwitcher } from '@/features/language-switcher';

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### Программное переключение языка

```tsx
import { useLanguageSwitcher } from '@/features/language-switcher';

export function MyComponent() {
  const { currentLocale, changeLanguage, isPending } = useLanguageSwitcher();

  return (
    <button 
      onClick={() => changeLanguage('en')}
      disabled={isPending}
    >
      Switch to English
    </button>
  );
}
```

## Зависимости

- `@/shared/config/routing` - конфигурация роутинга с поддержкой i18n
- `@/shared/config/i18n` - список поддерживаемых языков
- `@/shared/ui/*` - UI компоненты
- `next-intl` - библиотека интернационализации
- `lucide-react` - иконки

## Особенности

- Сохраняет текущий путь при смене языка
- Использует `useTransition` для плавного переключения
- Закрывается при клике вне компонента
- Показывает текущий активный язык
- Disabled state во время переключения

---

**Создано:** 26 ноября 2025 г.
