# Шаблон для режимов локации с двухслойной системой

Этот шаблон показывает, как создать новый режим локации с использованием двухслойной системы фильтров.

## Структура режима

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import type { YourModeState } from '@/types/filter'; // Ваш тип состояния

export function YourMode() {
    const t = useTranslations('filters');
    const {
        activeLocationMode,
        setLocationFilter,
        // Добавьте нужные методы для вашего режима
    } = useFilterStore();

    // Локальное состояние для этого режима
    const {
        currentLocalState,
        updateYourModeState, // Используйте соответствующий апдейтер
        clearLocalState,
    } = useLocalLocationState(activeLocationMode);

    // Локальное состояние (до применения)
    const localState = currentLocalState as YourModeState | null;
    const yourData = useMemo(
        () => localState?.yourData || defaultValue,
        [localState]
    );

    // === РАБОТА С ЛОКАЛЬНЫМ СЛОЕМ ===
    
    const handleChange = (newData: YourDataType) => {
        // Изменения идут ТОЛЬКО в localStorage
        updateYourModeState({ yourData: newData });
        console.log('Updated local state:', newData);
    };

    const handleClear = () => {
        // Очищаем локальное состояние
        clearLocalState('yourMode');
        
        // Очищаем применённый фильтр
        setLocationFilter(null);
        
        // Очищаем связанные данные на карте (если нужно)
        // clearYourMapData();
        
        console.log('Cleared local state and applied filters');
    };

    // === ПРИМЕНЕНИЕ В ГЛОБАЛЬНЫЙ STORE ===
    
    const handleApply = () => {
        // Применяем локальные изменения в глобальный store
        setLocationFilter({
            mode: 'yourMode',
            yourModeData: yourData, // Ваши данные
        });

        // Синхронизируем с картой/другими компонентами
        // updateMapWithYourData(yourData);

        console.log('Filter applied:', yourData);
    };

    return (
        <>
            {/* Ваш UI для редактирования данных */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Инпуты, селекты и т.д. */}
                {/* Используйте handleChange для обновления локального состояния */}
            </div>

            {/* Кнопки управления */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Кнопка очистить */}
                {yourData && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className={cn(
                            "h-8 cursor-pointer",
                            "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t('clear')}
                    </Button>
                )}

                {/* Кнопка применить */}
                <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!yourData}
                    className={cn(
                        "h-8 cursor-pointer",
                        "bg-brand-primary hover:bg-brand-primary-hover text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {t('apply')}
                </Button>
            </div>
        </>
    );
}
```

## Типы в types/filter.ts

```typescript
// 1. Добавьте тип для локального состояния вашего режима
export interface LocalYourModeState {
    yourData: YourDataType | null;
}

// 2. Добавьте в общий тип
export interface LocalLocationStates {
    search: LocalSearchModeState;
    draw: LocalDrawModeState;
    isochrone: LocalIsochroneModeState;
    radius: LocalRadiusModeState;
    yourMode: LocalYourModeState; // <-- Добавьте сюда
}
```

## Хук useLocalLocationState

Хук уже поддерживает любые режимы! Просто добавьте апдейтер:

```typescript
// В hooks/useLocalLocationState.ts

// Обновить состояние для вашего режима
const updateYourModeState = useCallback((
    updater: Partial<LocalYourModeState> | ((prev: LocalYourModeState) => LocalYourModeState)
) => {
    setLocalStates(prev => ({
        ...prev,
        yourMode: typeof updater === 'function'
            ? updater(prev.yourMode)
            : { ...prev.yourMode, ...updater }
    }));
}, []);

// Экспортируйте
return {
    // ... остальные
    updateYourModeState,
};
```

## Начальное состояние

```typescript
// В hooks/useLocalLocationState.ts

const INITIAL_STATES: LocalLocationStates = {
    search: { selectedLocations: [] },
    draw: { polygon: null },
    isochrone: { isochrone: null },
    radius: { radius: null },
    yourMode: { yourData: null }, // <-- Добавьте начальное состояние
};
```

## Ключевые моменты

1. **Локальное состояние** - все изменения идут через `updateYourModeState`
2. **Применение** - `handleApply` копирует из localStorage в store
3. **Очистка** - `handleClear` очищает и локальное, и глобальное состояние
4. **Персистентность** - localStorage автоматически сохраняет между сессиями
5. **Переключение режимов** - состояние сохраняется при смене режима

## Пример для Draw Mode

```typescript
const handleDrawPolygon = (polygon: DrawPolygon) => {
    updateDrawState({ polygon });
    console.log('Polygon drawn to local state');
};

const handleApply = () => {
    setLocationFilter({
        mode: 'draw',
        polygon: localState?.polygon,
    });
    // Отправить на бекенд
    console.log('Polygon filter applied');
};

const handleClear = () => {
    clearLocalState('draw');
    setLocationFilter(null);
    console.log('Draw filter cleared');
};
```

## Пример для Isochrone Mode

```typescript
const handleChangeIsochrone = (settings: IsochroneSettings) => {
    updateIsochroneState({ isochrone: settings });
    console.log('Isochrone settings changed locally');
};

const handleApply = () => {
    setLocationFilter({
        mode: 'isochrone',
        isochrone: localState?.isochrone,
    });
    // Запросить изохрон с API
    console.log('Isochrone filter applied');
};

const handleClear = () => {
    clearLocalState('isochrone');
    setLocationFilter(null);
    console.log('Isochrone filter cleared');
};
```

## Пример для Radius Mode

```typescript
const handleChangeRadius = (settings: RadiusSettings) => {
    updateRadiusState({ radius: settings });
    console.log('Radius settings changed locally');
};

const handleApply = () => {
    setLocationFilter({
        mode: 'radius',
        radius: localState?.radius,
    });
    // Нарисовать круг на карте
    console.log('Radius filter applied');
};

const handleClear = () => {
    clearLocalState('radius');
    setLocationFilter(null);
    console.log('Radius filter cleared');
};
```
