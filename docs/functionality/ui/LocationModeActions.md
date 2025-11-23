# LocationModeActions

**Что делает**: Универсальные кнопки действий для всех режимов фильтра локации (isochrone, draw, radius, search).

**Ключевые особенности**:
- Пропсы:
  - `hasLocalData` - есть ли несохранённые данные
  - `onClear` - очистка локального состояния
  - `onApply` - применение фильтра (сохранение в URL/store)
  - `onClose` - закрытие панели (опционально)
  - `showClose` - показывать ли кнопку закрытия
- Кнопки:
  - **Очистить** (Trash2) - удаляет локальные данные текущего режима
  - **Сохранить** (Check) - применяет фильтр в store/URL
  - **X** - закрывает панель (опционально)
- Локализация: `locationFilter.actions` namespace

**Файл**: `src/components/shared/LocationModeActions.tsx`

**Используется в**:
- MapIsochrone
- MapRadius (планируется)
- MapDraw (планируется)
- SearchLocationMode (планируется)
