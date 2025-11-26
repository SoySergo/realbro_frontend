# Theme Switcher Feature

## Описание

Feature для переключения темы оформления (светлая/темная) в приложении.

## Структура

```
theme-switcher/
├── model/
│   ├── use-theme-switcher.ts       # Hook для управления темой
│   └── index.ts
├── ui/
│   ├── ui.tsx                       # UI компонент переключателя
│   └── index.ts
└── index.ts
```

## Использование

### В компонентах

```tsx
import { ThemeSwitcher } from '@/features/theme-switcher';

export function Header() {
  return (
    <header>
      <ThemeSwitcher />
    </header>
  );
}
```

### Программное переключение темы

```tsx
import { useThemeSwitcher } from '@/features/theme-switcher';

export function MyComponent() {
  const { currentTheme, toggleTheme, mounted } = useThemeSwitcher();

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <button onClick={toggleTheme}>
      Current theme: {currentTheme}
    </button>
  );
}
```

## Зависимости

- `next-themes` - библиотека для управления темами
- `@/app/providers` - ThemeProvider должен быть обернут вокруг приложения
- `@/shared/ui/*` - UI компоненты
- `lucide-react` - иконки

## Особенности

- Поддержка светлой и темной темы
- Автоматическое определение системной темы
- Предотвращение flash of unstyled content (FOUC)
- Плавные переходы между темами
- Сохранение выбора в localStorage

## Настройка

Убедитесь, что в `layout.tsx` добавлен `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/app/providers';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

**Создано:** 26 ноября 2025 г.
