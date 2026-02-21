# RealBro Frontend — Agent Rules

## Project Context

Next.js 15 real estate search platform for Barcelona province with 9-language support (RU primary). Focus: rental apartments with map-based search using Mapbox GL.

## Language Policy

- **Code comments**: Russian (Русский)
- **Chat/responses**: Russian (Русский)
- **Console logs**: English
- **Git commits**: English (conventional commits: `feat:`, `fix:`, `refactor:`)

## Critical: i18n & Localization

**NEVER hardcode UI text.** All user-facing strings MUST use `next-intl`:

```typescript
// ✅ CORRECT
import { useTranslations } from 'next-intl';
const t = useTranslations('common');
<button>{t('search')}</button>

// ❌ WRONG — hardcoding forbidden
<button>Поиск</button>
```

Translation files: `src/locales/[locale]/[domain].json`
Supported locales: `ru` (default), `en`, `es`, `ca`, `uk`, `fr`, `it`, `pt`, `de`

## Architecture Patterns

### Server Components First
Default to Server Components. Use `"use client"` ONLY when needed (maps, stores, forms, event handlers).

```typescript
// Next.js 15: params and searchParams are Promises — always await them
const { id } = await params;
```

### Styling — CSS Variables Only
```typescript
// ✅ CORRECT
<div className="bg-background text-text-primary border-border">
<button className="bg-brand-primary hover:bg-brand-primary-hover">

// ❌ WRONG — hardcoded colors forbidden
<div className="bg-white text-black">
<button className="bg-blue-500">
```

Available Tailwind tokens:
- Brand: `brand-primary`, `brand-primary-hover`, `brand-primary-light`
- Backgrounds: `background`, `background-secondary`, `background-tertiary`
- Text: `text-primary`, `text-secondary`, `text-tertiary`
- Borders: `border`, `border-hover`
- States: `success`, `warning`, `error`, `info`
- Semantic: `price` (for prices)

### Package Manager
Use **pnpm** for all package operations.

### State Management
- **Zustand** — client-side UI state only (filters, open panels)
- **URL state** — search params via `nuqs`
- **Server Components** — for server data (primary approach)

## Import Order

```typescript
// 1. React/Next
import { FC } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libs
import { useStore } from 'zustand';

// 3. Internal components
import { PropertyCard } from '@/components/features/property';

// 4. Types (always use type imports)
import type { Property } from '@/types/property';

// 5. Utils
import { cn } from '@/lib/utils';
```

## Documentation

When creating a new component or feature:
1. Document in `docs/functionality/features/[feature]/ComponentName.md`
2. Update `docs/functionality/index.md`

## Pre-commit Checklist

- [ ] No hardcoded text (all via i18n)
- [ ] Comments in Russian, logs in English
- [ ] Types imported from `types/`
- [ ] No logic duplication
- [ ] Server Component unless interactivity required
- [ ] Documentation updated
- [ ] UI patterns from `/docs/UI_COMPONENTS_GUIDE.md` followed
