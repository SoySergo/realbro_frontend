'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MapPin, Clock, Circle, Pencil, Navigation, Briefcase } from 'lucide-react';

// Режимы локации
const locationModes = [
    { id: 'search', icon: MapPin },
    { id: 'isochrone', icon: Clock },
    { id: 'radius', icon: Circle },
    { id: 'draw', icon: Pencil },
] as const;

export function LocationDemo() {
    const t = useTranslations('landing.demo');
    const [activeMode, setActiveMode] = useState<string>('isochrone');
    const [animationStep, setAnimationStep] = useState(0);

    // Анимация изохрона
    useEffect(() => {
        if (activeMode === 'isochrone') {
            const interval = setInterval(() => {
                setAnimationStep((prev) => (prev + 1) % 4);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [activeMode]);

    const getModeLabel = (id: string) => {
        switch (id) {
            case 'search': return t('searchMode');
            case 'isochrone': return t('isochroneMode');
            case 'radius': return t('radiusMode');
            case 'draw': return t('drawMode');
            default: return '';
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-4 md:p-6">
            {/* Переключатель режимов */}
            <div className="mb-4 flex flex-wrap gap-2">
                {locationModes.map(({ id, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveMode(id)}
                        className={`flex items-center gap-2 rounded-lg px-3 md:px-4 py-2 text-sm font-medium transition-all ${
                            activeMode === id
                                ? 'bg-brand-primary text-white shadow-md'
                                : 'bg-background text-text-secondary hover:bg-background-tertiary border border-transparent hover:border-border'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{getModeLabel(id)}</span>
                    </button>
                ))}
            </div>

            {/* Интерактивная карта-превью */}
            <div className="relative h-56 md:h-64 overflow-hidden rounded-xl bg-gradient-to-br from-background-tertiary to-background border border-border">
                {/* Сетка карты */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-tertiary" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Центральная точка (работа) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <Badge className="bg-background text-text-primary border border-border shadow-sm">
                                {t('work')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Визуализация по режиму */}
                {activeMode === 'isochrone' && (
                    <>
                        {/* Изохрон - пульсирующие круги */}
                        <div 
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-success bg-success/10 transition-all duration-500 ${
                                animationStep >= 1 ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ width: '100px', height: '100px' }}
                        />
                        <div 
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-warning bg-warning/5 transition-all duration-500 ${
                                animationStep >= 2 ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ width: '160px', height: '160px' }}
                        />
                        <div 
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dotted border-info bg-info/5 transition-all duration-500 ${
                                animationStep >= 3 ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ width: '220px', height: '220px' }}
                        />
                    </>
                )}

                {activeMode === 'radius' && (
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-primary bg-brand-primary/10 animate-pulse"
                        style={{ width: '150px', height: '150px' }}
                    />
                )}

                {activeMode === 'draw' && (
                    <svg className="absolute inset-0 w-full h-full">
                        <polygon
                            points="80,60 200,40 250,120 220,180 100,190 50,140"
                            fill="rgba(25, 139, 255, 0.1)"
                            stroke="var(--brand-primary)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            className="animate-pulse"
                        />
                    </svg>
                )}

                {activeMode === 'search' && (
                    <>
                        <Badge className="absolute top-4 left-4 bg-brand-primary text-white">
                            Barcelona
                        </Badge>
                        <Badge className="absolute top-4 right-4 bg-background border border-border text-text-primary">
                            Eixample
                        </Badge>
                        <Badge className="absolute bottom-4 left-1/4 bg-background border border-border text-text-primary">
                            Gràcia
                        </Badge>
                    </>
                )}

                {/* Маркеры объектов */}
                <div className="absolute top-1/4 left-1/3 h-3 w-3 rounded-full bg-success shadow-lg animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-success shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="absolute bottom-1/3 left-1/4 h-3 w-3 rounded-full bg-success shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-1/4 right-1/3 h-3 w-3 rounded-full bg-success shadow-lg animate-bounce" style={{ animationDelay: '0.7s' }} />
            </div>

            {/* Информация о режиме */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-background p-3 border border-border">
                <div className="flex items-center gap-3">
                    {activeMode === 'isochrone' && (
                        <>
                            <Clock className="h-5 w-5 text-brand-primary" />
                            <div>
                                <p className="font-medium text-text-primary text-sm">
                                    {t('travelTime', { min: 30 })}
                                </p>
                                <p className="text-xs text-text-secondary">{t('walking')}</p>
                            </div>
                        </>
                    )}
                    {activeMode === 'radius' && (
                        <>
                            <Circle className="h-5 w-5 text-brand-primary" />
                            <div>
                                <p className="font-medium text-text-primary text-sm">
                                    {t('radiusKm', { km: 3 })}
                                </p>
                                <p className="text-xs text-text-secondary">Barcelona</p>
                            </div>
                        </>
                    )}
                    {activeMode === 'draw' && (
                        <>
                            <Pencil className="h-5 w-5 text-brand-primary" />
                            <div>
                                <p className="font-medium text-text-primary text-sm">
                                    {t('drawnArea')}
                                </p>
                                <p className="text-xs text-text-secondary">2.5 km²</p>
                            </div>
                        </>
                    )}
                    {activeMode === 'search' && (
                        <>
                            <MapPin className="h-5 w-5 text-brand-primary" />
                            <div>
                                <p className="font-medium text-text-primary text-sm">
                                    {t('selectedLocations')}
                                </p>
                                <p className="text-xs text-text-secondary">3 areas</p>
                            </div>
                        </>
                    )}
                </div>
                <Button size="sm" className="bg-brand-primary hover:bg-brand-primary-hover">
                    {t('showVariants', { count: 500 })}
                </Button>
            </div>
        </div>
    );
}
