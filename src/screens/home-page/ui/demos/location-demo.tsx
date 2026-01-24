'use client';

import { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { MapPin, Clock, Circle, Pencil } from 'lucide-react';

const locationModes = [
    { id: 'search', label: 'Поиск', icon: MapPin },
    { id: 'isochrone', label: 'Изохрон', icon: Clock },
    { id: 'radius', label: 'Радиус', icon: Circle },
    { id: 'draw', label: 'Рисование', icon: Pencil },
] as const;

const codeExamples: Record<string, string> = {
    search: `{
  "mode": "search",
  "locations": [
    { "type": "city", "name": "Barcelona" },
    { "type": "district", "name": "Eixample" }
  ]
}`,
    isochrone: `{
  "mode": "isochrone",
  "center": [2.1734, 41.3851],
  "profile": "walking",
  "minutes": 15
}`,
    radius: `{
  "mode": "radius",
  "center": [2.1734, 41.3851],
  "radiusKm": 2.5
}`,
    draw: `{
  "mode": "polygon",
  "coordinates": [
    [2.165, 41.390],
    [2.180, 41.395],
    [2.175, 41.380],
    [2.165, 41.390]
  ]
}`,
};

export function LocationDemo() {
    const [activeMode, setActiveMode] = useState<string>('search');

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-6">
            {/* Mode selector */}
            <div className="mb-4 flex flex-wrap gap-2">
                {locationModes.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveMode(id)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                            activeMode === id
                                ? 'bg-brand-primary text-white'
                                : 'bg-background text-text-secondary hover:bg-background-tertiary'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Map placeholder */}
            <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-background-tertiary">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="mx-auto mb-2 h-8 w-8 text-brand-primary" />
                        <p className="text-sm text-text-secondary">
                            {activeMode === 'search' && 'Выбранные локации'}
                            {activeMode === 'isochrone' && '15 мин пешком'}
                            {activeMode === 'radius' && 'Радиус 2.5 км'}
                            {activeMode === 'draw' && 'Нарисованная область'}
                        </p>
                    </div>
                </div>
                {/* Visual representation */}
                {activeMode === 'isochrone' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-dashed border-brand-primary bg-brand-primary/10" />
                )}
                {activeMode === 'radius' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-brand-primary bg-brand-primary/10" />
                )}
            </div>

            {/* Code block */}
            <div className="rounded-lg bg-background-tertiary p-4 font-mono text-sm">
                <pre className="text-text-secondary overflow-x-auto">
                    <code>{codeExamples[activeMode]}</code>
                </pre>
            </div>
        </div>
    );
}
