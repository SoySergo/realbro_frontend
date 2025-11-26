# App Providers

## Описание

Провайдеры приложения в соответствии с архитектурой Feature-Sliced Design (FSD). Эти провайдеры оборачивают все приложение и предоставляют глобальный контекст.

## Структура

```
app/providers/
├── ThemeProvider.tsx           # Провайдер темы (next-themes)
├── AuthErrorHandler.tsx        # Обработчик ошибок авторизации (TODO)
└── index.ts
```

## Использование

### В layout.tsx

```tsx
import { ThemeProvider, AuthErrorHandler } from '@/app/providers';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthErrorHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Провайдеры

### ThemeProvider

Провайдер темы на основе `next-themes`. Управляет переключением между светлой и темной темой.

**Конфигурация:**
- `attribute="data-theme"` - атрибут для применения темы
- `defaultTheme="light"` - тема по умолчанию
- `enableSystem` - поддержка системной темы
- `disableTransitionOnChange={false}` - плавные переходы

### AuthErrorHandler

Обработчик ошибок авторизации (заглушка для будущей интеграции с Auth.js/NextAuth).

**TODO:** Реализовать обработку ошибок авторизации

## Принципы

В FSD провайдеры размещаются в слое `app`, так как они:
- Предоставляют глобальный контекст для всего приложения
- Не содержат бизнес-логики
- Являются инфраструктурной частью приложения
- Работают на уровне роутинга

## Зависимости между слоями

```
app/providers/
  ↓ используется в
app/[locale]/layout.tsx
  ↓ предоставляет контекст для
pages/ → widgets/ → features/ → entities/ → shared/
```

## Добавление новых провайдеров

1. Создайте файл провайдера в `app/providers/`
2. Экспортируйте из `index.ts`
3. Добавьте в `layout.tsx`

```tsx
// app/providers/MyProvider.tsx
'use client';

export function MyProvider({ children }) {
  return <>{children}</>;
}
```

```tsx
// app/providers/index.ts
export { MyProvider } from './MyProvider';
```

```tsx
// app/[locale]/layout.tsx
import { ThemeProvider, MyProvider } from '@/app/providers';

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <MyProvider>
        {children}
      </MyProvider>
    </ThemeProvider>
  );
}
```

---

**Создано:** 26 ноября 2025 г.
