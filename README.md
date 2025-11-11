# RealEstate Barcelona - MVP

Сервис для поиска жилой недвижимости в аренду в провинции Барселона.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm (рекомендуется)

### Установка

1. Установите зависимости:
```bash
pnpm install
```

2. Создайте файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

3. Получите Mapbox токен на [mapbox.com](https://account.mapbox.com/) и добавьте в `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_actual_token_here
```

4. Запустите dev сервер:
```bash
pnpm dev
```

5. Откройте браузер: [http://localhost:3000/ru](http://localhost:3000/ru)

## 📁 Структура проекта

```
my-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── [locale]/          # Мультиязычность
│   │   └── api/               # API Routes
│   ├── components/            # React компоненты
│   ├── lib/                  # Утилиты
│   ├── services/             # API клиенты
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript типы
│   ├── hooks/                # Custom hooks
│   ├── config/               # Конфигурация
│   └── locales/              # Переводы (9 языков)
```

## 🌍 Поддерживаемые языки

🇷🇺 RU • 🇬🇧 EN • 🇪🇸 ES • 🇨🇦 CA • 🇺🇦 UK • 🇫🇷 FR • 🇮🇹 IT • 🇵🇹 PT • 🇩🇪 DE

URL: `/{locale}/...` (например `/ru/property/123`)

## 🛠 Технологии

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + Zod
- Mapbox GL + react-map-gl
- next-intl

## 📚 Документация

См. `/docs`:
- `01-project-structure.md`
- `02-development-guidelines.md`
- `03-tech-stack.md`
