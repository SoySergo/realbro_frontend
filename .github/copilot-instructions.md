# Copilot Instructions - Real Estate Barcelona MVP

## 🎯 Project Context

Next.js 15 real estate search platform for Barcelona province with 9-language support (RU primary). Focus: rental apartments with map-based search using Mapbox GL.

## 🗣️ Communication & Language Rules

- **Code comments**: Russian (Русский)
- **Chat/responses**: Russian (Русский)
- **Console logs**: English
- **Git commits**: English (conventional commits: `feat:`, `fix:`, `refactor:`)

```typescript
// ✅ Форматируем цену для отображения
console.log('Formatting property price', { price, currency });
```

## 📝 Critical: i18n & Localization

**NEVER hardcode UI text.** All user-facing strings MUST use `next-intl`:

```typescript
// ✅ CORRECT
import { useTranslations } from 'next-intl';
const t = useTranslations('common');
<button>{t('search')}</button>

// ❌ WRONG
<button>Поиск</button>
```

**Translation files**: `src/locales/[locale]/[domain].json`
- `common.json` - buttons, labels, navigation
- `property.json` - property-specific terms
- `filters.json` - search filters

**Supported locales**: `ru` (default), `en`, `es`, `ca`, `uk`, `fr`, `it`, `pt`, `de`
**URL structure**: `/{locale}/property/123` (e.g., `/ru/property/123`)

## 🏗️ Architecture Patterns

### Server Components First
Default to Server Components. Use `"use client"` ONLY when needed:
- Interactive maps (Mapbox)
- Zustand stores
- Forms with `useState`/`useEffect`
- Event handlers

```typescript
// ✅ Server Component by default
async function PropertyPage({ params }: Props) {
  const { id } = await params; // Next.js 15: params is Promise
  const property = await fetchProperty(id);
  return <PropertyDetails property={property} />;
}
```

### Next.js 15 Specifics
- `params` and `searchParams` are **Promises** - always `await` them
- Middleware runs on Edge runtime - keep it lightweight
- Use `next/navigation` (`useRouter`, `useSearchParams`, `redirect`)

### Import Organization
```typescript
// 1. React/Next
import { FC } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libs
import { useStore } from 'zustand';
import { z } from 'zod';

// 3. Internal components
import { PropertyCard } from '@/components/features/property';

// 4. Types
import type { Property } from '@/types/property';

// 5. Utils
import { cn } from '@/lib/utils';
```

## 📂 Directory Structure

```
src/
├── app/
│   ├── [locale]/           # i18n routes (await params)
│   │   ├── page.tsx        # Server Component
│   │   └── property/[id]/
│   └── api/                # API routes
├── components/
│   ├── features/           # Feature-based (map, search, property)
│   ├── layout/             # Header, Footer
│   └── ui/                 # shadcn components
├── types/                  # property.ts, filter.ts, api.ts
├── lib/                    # utils.ts (cn helper)
├── config/                 # env.ts (Zod validation), i18n.ts
├── locales/[locale]/       # Translation JSON files
├── store/                  # Zustand (empty - add as needed)
└── services/               # API clients (empty - add as needed)
```

## 🔧 Key Technical Decisions

### State Management Strategy
- **Server Components**: Fetch data server-side (primary approach)
- **Zustand**: Client-side UI state (filters, map viewport, open panels)
- **URL state**: Search parameters via `nuqs` for shareable links
- **No global data store** - avoid duplicating server data on client

### Styling
- **Tailwind CSS** utility-first
- `cn()` helper from `lib/utils.ts` for conditional classes
- **shadcn/ui** components (add via `npx shadcn@latest add [component]`)

### Environment Variables
Validated via Zod in `src/config/env.ts`:
```typescript
NEXT_PUBLIC_MAPBOX_TOKEN  // Required
NEXT_PUBLIC_APP_URL       // Default: http://localhost:3000
```

### Type System
- Use existing types from `types/` folder
- `Property`, `PropertyType`, `PropertyFeature` in `types/property.ts`
- `PropertyFilters`, `FilterOption` in `types/filter.ts`

## 📋 Development Workflow

### Adding New Features
1. Create component in `src/components/features/[feature]/`
2. Add types to `src/types/` if needed
3. Add Zustand store to `src/store/` if client state required
4. **Document** in `docs/functionality/features/[feature]/ComponentName.md`
5. **Update index**: `docs/functionality/index.md`
6. Add i18n keys to all locale files

### Documentation Format (keep brief)
```markdown
# ComponentName

**Purpose**: One-sentence description.

**Key Features**:
- Props: main props and their purpose
- State: what state it manages
- API: which endpoints it uses (if any)

**File**: `src/components/features/[feature]/ComponentName.tsx`
```

### Pre-commit Checklist
- [ ] No hardcoded text (all via i18n)
- [ ] Comments in Russian, logs in English
- [ ] Types imported from `types/`
- [ ] No logic duplication
- [ ] Server Component unless interactivity required
- [ ] Documentation updated

## 🚀 Common Commands

```bash
pnpm dev                                    # Start dev server
pnpm build                                  # Production build
pnpm lint                                   # Run ESLint

# Add shadcn components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Access app
http://localhost:3000/ru                   # Russian (default)
http://localhost:3000/en                   # English
```

## 🔍 Code Examples

### Creating Client Component with Zustand
```typescript
'use client';
import { create } from 'zustand';

// Стор фильтров
interface FilterStore {
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
}

const useFilterStore = create<FilterStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
}));
```

### API Route with Validation
```typescript
// app/api/properties/route.ts
import { z } from 'zod';

const querySchema = z.object({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = querySchema.parse(Object.fromEntries(searchParams));
  
  console.log('Fetching properties', filters);
  // ...
}
```

### Using Translations
```typescript
import { useTranslations } from 'next-intl';

function PropertyCard({ property }: { property: Property }) {
  const t = useTranslations('property');
  
  return (
    <div>
      <h2>{property.title}</h2>
      <p>{t('price')}: {property.price}€</p>
    </div>
  );
}
```

## ⚠️ Common Pitfalls

1. **Don't add `"use client"` to page.tsx** - extract interactive parts to separate components
2. **Always `await params`** in Next.js 15: `const { id } = await params`
3. **Check locale exists** before creating new translation keys
4. **Use type imports**: `import type { Property } from '@/types/property'`
5. **Mapbox requires client component** - use `dynamic` import with `ssr: false`

## 🎯 MVP Priorities

**Current state**: Basic i18n setup, types defined, no components yet.

**Next steps**:
1. Map component with Mapbox GL (`components/features/map/`)
2. Search filters with Zustand (`components/features/search/`)
3. Property cards and list (`components/features/property/`)
4. API routes for mock data (`app/api/properties/`)

**Avoid over-engineering**: Start simple, add complexity when needed. No premature abstractions.

---

**Remember**: Quality > Speed. Follow project patterns. Document as you build.
