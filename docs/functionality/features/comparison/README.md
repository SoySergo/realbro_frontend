# Property Comparison Feature

**Что делает**: Позволяет пользователям сравнивать до 4 объектов недвижимости в таблице с характеристиками. Подсвечивает лучшие значения (мин. цена, макс. площадь и др.)

**Ключевые особенности**:
- **Store**: `useComparisonStore` (Zustand с persist) - хранит ID и данные объектов
- **Максимум объектов**: 4 (константа `COMPARISON_MAX_ITEMS`)
- **Методы**: `addToComparison`, `removeFromComparison`, `toggleComparison`, `clearComparison`
- **Селекторы**: `useComparisonIds`, `useIsInComparison`, `useComparisonCount`

**UI компоненты**:
- `CompareButton` - кнопка добавления (варианты: icon/text/full)
- `PropertyCompareButton` - кнопка с переводами из контекста
- `PropertyCompareMenuItem` - пункт меню для DropdownMenu
- `FloatingComparisonBar` - плавающая панель внизу экрана

**Интеграции**:
- PropertyCardGrid (слоты `actions`, `menuItems`)
- PropertyCardHorizontal (слот `actions`)
- PropertyDetailWidget
- MapSidebar (desktop/mobile)
- AIAgentPropertyFeed (chat)
- DesktopSidebar (пункт навигации с badge)

**Файлы**:
- Feature: `src/features/comparison/`
- Widget: `src/widgets/comparison-panel/`
- Screen: `src/screens/comparison-page/`
- Page: `src/app/[locale]/compare/page.tsx`
- Provider: `src/app/providers/comparison-bar-provider.tsx`

**Локализация**: `messages/[locale].json` → секция `comparison`, `sidebar.compare`
