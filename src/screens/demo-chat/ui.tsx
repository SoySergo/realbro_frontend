'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
    Bot,
    User,
    Send,
    ChevronDown,
    Heart,
    ThumbsDown,
    Bookmark,
    MapPin,
    BedDouble,
    Bath,
    Ruler,
    Building2,
    Train,
    Play,
    Pause,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Expand,
    Sparkles,
    Filter,
    X,
    Home,
} from 'lucide-react';

import type { Property } from '@/entities/property';
import { generateMockProperty } from '@/shared/api/chat';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

// === Типы для демо ===

interface DemoMessage {
    id: string;
    type: 'text' | 'property' | 'system';
    content: string;
    timestamp: Date;
    isOwn: boolean;
    property?: Property;
    filterName?: string;
    isViewed?: boolean;
    isNew?: boolean;
}

type ChatLayout = 'telegram' | 'feed' | 'cards';
type CardVariant = 'compact' | 'horizontal' | 'gallery' | 'minimal' | 'map-preview' | 'story';

const LAYOUT_LABELS: Record<ChatLayout, string> = {
    telegram: 'Layout A: Telegram',
    feed: 'Layout B: Feed',
    cards: 'Layout C: Cards',
};

const CARD_LABELS: Record<CardVariant, string> = {
    compact: '1: Compact Bubble',
    horizontal: '2: Horizontal',
    gallery: '3: Gallery',
    minimal: '4: Minimal',
    'map-preview': '5: Map Preview',
    story: '6: Story',
};

// === Генерация мок-данных ===

function generateDemoMessages(): DemoMessage[] {
    const now = new Date();
    const messages: DemoMessage[] = [];
    const filterNames = [
        'Barcelona Center',
        'Gracia Budget',
        'Eixample Premium',
        'Gothic Quarter',
        'Sarrià Family',
    ];

    // Системное сообщение
    messages.push({
        id: 'sys_1',
        type: 'system',
        content: 'AI Agent started monitoring 5 search filters',
        timestamp: new Date(now.getTime() - 2 * 24 * 3600000),
        isOwn: false,
    });

    // Вчерашние объекты
    for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() - 24 * 3600000 + i * 600000);
        messages.push({
            id: `prop_y_${i}`,
            type: 'property',
            content: '',
            timestamp: time,
            isOwn: false,
            property: generateMockProperty(100 + i),
            filterName: filterNames[i % filterNames.length],
            isViewed: i < 7,
        });
    }

    // Сообщение пользователя
    messages.push({
        id: 'user_1',
        type: 'text',
        content: 'Show me more apartments in Gracia under 1200€',
        timestamp: new Date(now.getTime() - 20 * 3600000),
        isOwn: true,
    });

    // Ответ AI
    messages.push({
        id: 'ai_resp_1',
        type: 'text',
        content: 'I found 5 new listings matching your criteria in Gracia. Here they are:',
        timestamp: new Date(now.getTime() - 19.9 * 3600000),
        isOwn: false,
    });

    // Сегодняшние объекты
    for (let i = 0; i < 15; i++) {
        const time = new Date(now.getTime() - 8 * 3600000 + i * 600000);
        messages.push({
            id: `prop_t_${i}`,
            type: 'property',
            content: '',
            timestamp: time,
            isOwn: false,
            property: generateMockProperty(200 + i),
            filterName: filterNames[i % filterNames.length],
            isViewed: i < 5,
            isNew: i >= 10,
        });
    }

    return messages;
}

// === Вспомогательные функции ===

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
}

function formatPrice(price: number): string {
    return `€${price.toLocaleString()}/mo`;
}

// === Карусель изображений (общая) ===

function ImageCarousel({
    images,
    aspectRatio = 'aspect-video',
    className,
    overlay,
}: {
    images: string[];
    aspectRatio?: string;
    className?: string;
    overlay?: React.ReactNode;
}) {
    const [current, setCurrent] = useState(0);

    const prev = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrent((c) => (c - 1 + images.length) % images.length);
        },
        [images.length],
    );

    const next = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrent((c) => (c + 1) % images.length);
        },
        [images.length],
    );

    return (
        <div className={cn('group relative overflow-hidden', aspectRatio, className)}>
            <Image
                src={images[current]}
                alt="Property"
                fill
                className="object-cover transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized
            />
            {overlay}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    {/* Индикаторы */}
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {images.slice(0, 5).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-1.5 w-1.5 rounded-full transition-colors',
                                    i === current % 5 ? 'bg-white' : 'bg-white/50',
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// === Кнопки действий ===

function ActionButtons({ compact = false }: { compact?: boolean }) {
    return (
        <div className={cn('flex gap-1', compact ? 'gap-0.5' : 'gap-1.5')}>
            <button className="rounded-full bg-background-secondary p-1.5 text-text-secondary transition-colors hover:bg-brand-primary-light hover:text-brand-primary">
                <Heart className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            </button>
            <button className="rounded-full bg-background-secondary p-1.5 text-text-secondary transition-colors hover:bg-red-100 hover:text-red-500">
                <ThumbsDown className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            </button>
            <button className="rounded-full bg-background-secondary p-1.5 text-text-secondary transition-colors hover:bg-brand-primary-light hover:text-brand-primary">
                <Bookmark className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            </button>
        </div>
    );
}

// === ВАРИАНТ 1: Compact Bubble ===

function CardCompactBubble({ property, filterName }: { property: Property; filterName?: string }) {
    return (
        <div className="max-w-xs rounded-2xl rounded-tl-sm bg-card p-2 shadow-sm">
            <div className="flex gap-2">
                {/* Миниатюра */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                    />
                    {property.isNew && (
                        <span className="absolute top-1 left-1 rounded bg-brand-primary px-1 py-0.5 text-[10px] font-bold text-white">
                            NEW
                        </span>
                    )}
                </div>
                {/* Информация */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            {formatPrice(property.price)}
                        </p>
                        <p className="text-xs text-text-secondary">
                            {property.rooms}BR · {property.area}m² · {property.type}
                        </p>
                    </div>
                    <p className="truncate text-xs text-text-tertiary">
                        <MapPin className="mr-0.5 inline h-3 w-3" />
                        {property.address}
                    </p>
                </div>
            </div>
            {/* Действия */}
            <div className="mt-1.5 flex items-center justify-between border-t border-border pt-1.5">
                {filterName && (
                    <Badge variant="secondary" className="text-[10px]">
                        <Filter className="mr-0.5 h-2.5 w-2.5" />
                        {filterName}
                    </Badge>
                )}
                <ActionButtons compact />
            </div>
        </div>
    );
}

// === ВАРИАНТ 2: Horizontal Card ===

function CardHorizontal({ property, filterName }: { property: Property; filterName?: string }) {
    return (
        <div className="flex max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Изображение слева */}
            <div className="relative h-auto w-[120px] shrink-0">
                <ImageCarousel
                    images={property.images}
                    aspectRatio=""
                    className="h-full w-full"
                />
            </div>
            {/* Контент справа */}
            <div className="flex flex-1 flex-col justify-between p-2.5">
                <div>
                    <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-text-primary">
                            {formatPrice(property.price)}
                        </p>
                        {filterName && (
                            <Badge variant="secondary" className="text-[9px]">
                                {filterName}
                            </Badge>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                        <BedDouble className="mr-0.5 inline h-3 w-3" />
                        {property.rooms}BR
                        <span className="mx-1">·</span>
                        <Ruler className="mr-0.5 inline h-3 w-3" />
                        {property.area}m²
                        <span className="mx-1">·</span>
                        <Building2 className="mr-0.5 inline h-3 w-3" />
                        {property.floor}/{property.totalFloors}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">
                        {property.address}, {property.neighborhood || property.city}
                    </p>
                </div>
                <ActionButtons compact />
            </div>
        </div>
    );
}

// === ВАРИАНТ 3: Gallery Card ===

function CardGallery({ property, filterName }: { property: Property; filterName?: string }) {
    return (
        <div className="max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-md">
            {/* Карусель */}
            <ImageCarousel
                images={property.images}
                aspectRatio="aspect-video"
                overlay={
                    <div className="absolute top-2 left-2 flex gap-1">
                        {property.isNew && (
                            <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                NEW
                            </span>
                        )}
                        {filterName && (
                            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                                {filterName}
                            </span>
                        )}
                    </div>
                }
            />
            {/* Минимальная информация */}
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-text-primary">
                        {formatPrice(property.price)}
                    </p>
                    <div className="flex gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-0.5">
                            <BedDouble className="h-3.5 w-3.5" /> {property.rooms}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Ruler className="h-3.5 w-3.5" /> {property.area}m²
                        </span>
                    </div>
                </div>
                {/* Полоса действий */}
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <p className="truncate text-xs text-text-tertiary">
                        <MapPin className="mr-0.5 inline h-3 w-3" />
                        {property.address}
                    </p>
                    <ActionButtons compact />
                </div>
            </div>
        </div>
    );
}

// === ВАРИАНТ 4: Minimal Card ===

function CardMinimal({
    property,
    filterName,
    isViewed,
}: {
    property: Property;
    filterName?: string;
    isViewed?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={cn(
                'cursor-pointer rounded-lg border transition-all',
                isViewed
                    ? 'border-border bg-card'
                    : 'border-brand-primary/30 bg-brand-primary-light',
            )}
        >
            {/* Компактная строка */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-2 p-2 text-left"
            >
                <Home className="h-4 w-4 shrink-0 text-brand-primary" />
                <span className="flex-1 truncate text-sm text-text-primary">
                    {property.neighborhood || 'Barcelona'}, {property.rooms}BR, {property.area}m²,{' '}
                    {formatPrice(property.price)}
                </span>
                {filterName && (
                    <Badge variant="secondary" className="shrink-0 text-[9px]">
                        {filterName}
                    </Badge>
                )}
                <Expand className={cn('h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform', expanded && 'rotate-45')} />
            </button>

            {/* Развёрнутое содержимое */}
            {expanded && (
                <div className="animate-message-slide-in border-t border-border p-2">
                    <ImageCarousel images={property.images} aspectRatio="aspect-video" className="rounded-lg" />
                    <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-text-secondary">
                            <BedDouble className="mr-0.5 inline h-3 w-3" />
                            {property.rooms} rooms
                            <span className="mx-1">·</span>
                            <Bath className="mr-0.5 inline h-3 w-3" />
                            {property.bathrooms} bath
                            <span className="mx-1">·</span>
                            Floor {property.floor}/{property.totalFloors}
                        </div>
                        <ActionButtons compact />
                    </div>
                    <p className="mt-1 truncate text-xs text-text-tertiary">{property.address}</p>
                </div>
            )}
        </div>
    );
}

// === ВАРИАНТ 5: Map Preview Card ===

function CardMapPreview({ property, filterName }: { property: Property; filterName?: string }) {
    return (
        <div className="max-w-xs overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Изображение с оверлеем района */}
            <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2">
                    <p className="text-sm font-bold text-white">
                        {property.neighborhood || property.district || 'Barcelona'}
                    </p>
                </div>
                {filterName && (
                    <Badge variant="primary" className="absolute top-2 right-2 text-[10px]">
                        {filterName}
                    </Badge>
                )}
            </div>
            {/* Цена и ключевые характеристики */}
            <div className="p-2.5">
                <p className="text-sm font-bold text-text-primary">{formatPrice(property.price)}</p>
                <div className="mt-1.5 flex gap-1.5">
                    <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px] text-text-secondary">
                        {property.rooms} BR
                    </span>
                    <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px] text-text-secondary">
                        {property.area}m²
                    </span>
                    {property.nearbyTransport && (
                        <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px] text-text-secondary">
                            <Train className="mr-0.5 inline h-2.5 w-2.5" />
                            {property.nearbyTransport.walkMinutes} min
                        </span>
                    )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-text-tertiary">
                    {property.description}
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    View on map
                </Button>
            </div>
        </div>
    );
}

// === ВАРИАНТ 6: Story Card ===

function CardStory({ property }: { property: Property }) {
    const [imgIdx, setImgIdx] = useState(0);

    // Переключение по клику
    const cycleImage = useCallback(() => {
        setImgIdx((c) => (c + 1) % property.images.length);
    }, [property.images.length]);

    return (
        <div
            onClick={cycleImage}
            className="relative w-48 cursor-pointer overflow-hidden rounded-2xl shadow-lg"
        >
            <div className="relative aspect-[3/4]">
                <Image
                    src={property.images[imgIdx]}
                    alt={property.title}
                    fill
                    className="object-cover transition-all duration-300"
                    sizes="192px"
                    unoptimized
                />
                {/* Прогресс-бар */}
                <div className="absolute top-2 left-2 right-2 flex gap-0.5">
                    {property.images.slice(0, 5).map((_, i) => (
                        <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                            <div
                                className={cn(
                                    'h-full rounded-full bg-white transition-all duration-300',
                                    i < imgIdx % 5 ? 'w-full' : i === imgIdx % 5 ? 'w-full' : 'w-0',
                                )}
                            />
                        </div>
                    ))}
                </div>
                {/* Значки характеристик поверх изображения */}
                <div className="absolute top-6 right-2 flex flex-col gap-1">
                    <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
                        <BedDouble className="mr-0.5 inline h-2.5 w-2.5" />
                        {property.rooms}
                    </span>
                    <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
                        <Ruler className="mr-0.5 inline h-2.5 w-2.5" />
                        {property.area}m²
                    </span>
                </div>
                {/* Градиент и цена снизу */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                    <p className="text-lg font-bold text-white">{formatPrice(property.price)}</p>
                    <p className="truncate text-xs text-white/80">
                        {property.neighborhood || property.city}
                    </p>
                </div>
            </div>
        </div>
    );
}

// === Рендерер варианта карточки ===

function PropertyCardRenderer({
    variant,
    property,
    filterName,
    isViewed,
}: {
    variant: CardVariant;
    property: Property;
    filterName?: string;
    isViewed?: boolean;
}) {
    switch (variant) {
        case 'compact':
            return <CardCompactBubble property={property} filterName={filterName} />;
        case 'horizontal':
            return <CardHorizontal property={property} filterName={filterName} />;
        case 'gallery':
            return <CardGallery property={property} filterName={filterName} />;
        case 'minimal':
            return <CardMinimal property={property} filterName={filterName} isViewed={isViewed} />;
        case 'map-preview':
            return <CardMapPreview property={property} filterName={filterName} />;
        case 'story':
            return <CardStory property={property} />;
    }
}

// ==============================================================
// === LAYOUT A: Telegram Style ===
// ==============================================================

function LayoutTelegram({
    messages,
    cardVariant,
}: {
    messages: DemoMessage[];
    cardVariant: CardVariant;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Авто-скролл при новых сообщениях
    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages.length]);

    // Отслеживание скролла
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setShowScrollBtn(!isNearBottom);
    }, []);

    const scrollToBottom = useCallback(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, []);

    // Предвычисляем, какие сообщения являются первыми в своём дне
    const dateSeparatorIds = useMemo(() => {
        const ids = new Set<string>();
        let prev: string | null = null;
        for (const msg of messages) {
            const d = formatDate(msg.timestamp);
            if (d !== prev) {
                ids.add(msg.id);
                prev = d;
            }
        }
        return ids;
    }, [messages]);

    return (
        <div className="flex h-[600px] flex-col rounded-xl border border-border bg-background">
            {/* Шапка */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary">
                    <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-primary">AI Property Agent</p>
                    <p className="text-xs text-success">Online · monitoring 5 filters</p>
                </div>
            </div>

            {/* Область сообщений */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 space-y-2 overflow-y-auto bg-background-secondary p-4"
            >
                {messages.map((msg) => {
                    const showDate = dateSeparatorIds.has(msg.id);

                    return (
                        <div key={msg.id}>
                            {/* Разделитель дат */}
                            {showDate && (
                                <div className="my-3 flex items-center justify-center">
                                    <span className="rounded-full bg-background-tertiary px-3 py-1 text-[11px] text-text-tertiary">
                                        {formatDate(msg.timestamp)}
                                    </span>
                                </div>
                            )}

                            {/* Системное сообщение */}
                            {msg.type === 'system' && (
                                <div className="flex justify-center">
                                    <span className="rounded-lg bg-background-tertiary px-3 py-1.5 text-xs text-text-secondary">
                                        <Sparkles className="mr-1 inline h-3 w-3 text-brand-primary" />
                                        {msg.content}
                                    </span>
                                </div>
                            )}

                            {/* Текстовое сообщение */}
                            {msg.type === 'text' && (
                                <div
                                    className={cn(
                                        'flex gap-2',
                                        msg.isOwn ? 'justify-end' : 'justify-start',
                                    )}
                                >
                                    {!msg.isOwn && (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            'max-w-[75%] rounded-2xl px-3 py-2',
                                            msg.isOwn
                                                ? 'rounded-tr-sm bg-brand-primary text-white'
                                                : 'rounded-tl-sm bg-card text-text-primary shadow-sm',
                                        )}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p
                                            className={cn(
                                                'mt-0.5 text-right text-[10px]',
                                                msg.isOwn ? 'text-white/70' : 'text-text-tertiary',
                                            )}
                                        >
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                    {msg.isOwn && (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-tertiary">
                                            <User className="h-4 w-4 text-text-secondary" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Карточка объекта */}
                            {msg.type === 'property' && msg.property && (
                                <div className="flex gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="animate-message-slide-in">
                                        <PropertyCardRenderer
                                            variant={cardVariant}
                                            property={msg.property}
                                            filterName={msg.filterName}
                                            isViewed={msg.isViewed}
                                        />
                                        <p className="mt-0.5 text-[10px] text-text-tertiary">
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Кнопка скролла вниз */}
            {showScrollBtn && (
                <div className="relative">
                    <button
                        onClick={scrollToBottom}
                        className="absolute -top-12 right-4 rounded-full bg-card p-2 shadow-md transition-transform hover:scale-105"
                    >
                        <ChevronDown className="h-5 w-5 text-text-secondary" />
                    </button>
                </div>
            )}

            {/* Поле ввода */}
            <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand-primary"
                />
                <Button size="icon" className="rounded-full">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ==============================================================
// === LAYOUT B: Feed Style ===
// ==============================================================

function LayoutFeed({
    messages,
    cardVariant,
}: {
    messages: DemoMessage[];
    cardVariant: CardVariant;
}) {
    const [dayFilter, setDayFilter] = useState<'today' | 'yesterday' | 'all'>('all');

    const propertyMessages = messages.filter((m) => m.type === 'property' && m.property);

    const filteredMessages = propertyMessages.filter((msg) => {
        if (dayFilter === 'all') return true;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (dayFilter === 'today') return isSameDay(msg.timestamp, today);
        if (dayFilter === 'yesterday') return isSameDay(msg.timestamp, yesterday);
        return true;
    });

    const viewedMessages = filteredMessages.filter((m) => m.isViewed);
    const unviewedMessages = filteredMessages.filter((m) => !m.isViewed);

    const newCount = filteredMessages.filter((m) => m.isNew).length;

    return (
        <div className="flex h-[600px] flex-col rounded-xl border border-border bg-background">
            {/* Липкий фильтр */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
                <div className="flex gap-1">
                    {(['today', 'yesterday', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setDayFilter(f)}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                dayFilter === f
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary',
                            )}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                {newCount > 0 && (
                    <Badge variant="primary" className="text-[10px]">
                        {newCount} new
                    </Badge>
                )}
            </div>

            {/* Лента */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {/* Непросмотренные */}
                {unviewedMessages.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Not viewed ({unviewedMessages.length})</span>
                            <div className="flex-1 border-t border-border" />
                        </div>
                        {unviewedMessages.map((msg) => (
                            <div key={msg.id} className="animate-message-slide-in">
                                <PropertyCardRenderer
                                    variant={cardVariant}
                                    property={msg.property!}
                                    filterName={msg.filterName}
                                    isViewed={msg.isViewed}
                                />
                            </div>
                        ))}
                    </>
                )}

                {/* Просмотренные */}
                {viewedMessages.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Eye className="h-3.5 w-3.5" />
                            <span>Viewed ({viewedMessages.length})</span>
                            <div className="flex-1 border-t border-border" />
                        </div>
                        {viewedMessages.map((msg) => (
                            <div key={msg.id} className="opacity-70">
                                <PropertyCardRenderer
                                    variant={cardVariant}
                                    property={msg.property!}
                                    filterName={msg.filterName}
                                    isViewed={msg.isViewed}
                                />
                            </div>
                        ))}
                    </>
                )}

                {filteredMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                        <Building2 className="mb-2 h-8 w-8" />
                        <p className="text-sm">No properties for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==============================================================
// === LAYOUT C: Split Cards ===
// ==============================================================

function LayoutSplitCards({
    messages,
    cardVariant,
}: {
    messages: DemoMessage[];
    cardVariant: CardVariant;
}) {
    const propertyMessages = messages.filter((m) => m.type === 'property' && m.property);
    const [selectedId, setSelectedId] = useState<string | null>(
        propertyMessages[0]?.id || null,
    );

    const selectedMsg = propertyMessages.find((m) => m.id === selectedId);

    return (
        <div className="flex h-[600px] overflow-hidden rounded-xl border border-border bg-background">
            {/* Левая панель: список превью */}
            <div className="w-72 shrink-0 overflow-y-auto border-r border-border bg-card">
                <div className="sticky top-0 border-b border-border bg-card px-3 py-2.5">
                    <p className="text-xs font-semibold text-text-primary">
                        Properties ({propertyMessages.length})
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {propertyMessages.map((msg) => (
                        <button
                            key={msg.id}
                            onClick={() => setSelectedId(msg.id)}
                            className={cn(
                                'flex w-full items-center gap-2.5 p-2.5 text-left transition-colors',
                                selectedId === msg.id
                                    ? 'bg-brand-primary-light'
                                    : 'hover:bg-background-secondary',
                                msg.isNew && 'ring-1 ring-inset ring-brand-primary/30',
                            )}
                        >
                            {/* Миниатюра */}
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                    src={msg.property!.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized
                                />
                                {msg.isNew && (
                                    <div className="absolute inset-0 animate-pulse rounded-lg ring-2 ring-brand-primary/50" />
                                )}
                            </div>
                            {/* Информация */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-text-primary">
                                    {formatPrice(msg.property!.price)}
                                </p>
                                <p className="truncate text-[11px] text-text-secondary">
                                    {msg.property!.rooms}BR · {msg.property!.area}m²
                                </p>
                                <p className="truncate text-[10px] text-text-tertiary">
                                    {msg.property!.neighborhood || msg.property!.address}
                                </p>
                            </div>
                            {/* Статус */}
                            {!msg.isViewed && (
                                <div className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Правая панель: детали */}
            <div className="flex flex-1 flex-col overflow-y-auto">
                {selectedMsg?.property ? (
                    <div className="p-4">
                        <div className="mx-auto max-w-lg">
                            <PropertyCardRenderer
                                variant={cardVariant}
                                property={selectedMsg.property}
                                filterName={selectedMsg.filterName}
                                isViewed={selectedMsg.isViewed}
                            />
                            {/* Расширенные детали */}
                            <div className="mt-4 rounded-xl border border-border bg-card p-4">
                                <h3 className="text-sm font-semibold text-text-primary">
                                    {selectedMsg.property.title}
                                </h3>
                                <p className="mt-1 text-xs text-text-secondary">
                                    {selectedMsg.property.description}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg bg-background-secondary p-2">
                                        <p className="text-text-tertiary">Price</p>
                                        <p className="font-semibold text-text-primary">
                                            {formatPrice(selectedMsg.property.price)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-background-secondary p-2">
                                        <p className="text-text-tertiary">Area</p>
                                        <p className="font-semibold text-text-primary">
                                            {selectedMsg.property.area}m²
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-background-secondary p-2">
                                        <p className="text-text-tertiary">Rooms</p>
                                        <p className="font-semibold text-text-primary">
                                            {selectedMsg.property.rooms} bedrooms
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-background-secondary p-2">
                                        <p className="text-text-tertiary">Floor</p>
                                        <p className="font-semibold text-text-primary">
                                            {selectedMsg.property.floor}/{selectedMsg.property.totalFloors}
                                        </p>
                                    </div>
                                </div>
                                {selectedMsg.property.nearbyTransport && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
                                        <Train className="h-3.5 w-3.5" />
                                        {selectedMsg.property.nearbyTransport.name}
                                        <span className="text-text-tertiary">
                                            · {selectedMsg.property.nearbyTransport.walkMinutes} min walk
                                        </span>
                                    </div>
                                )}
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" className="flex-1">
                                        <Heart className="mr-1 h-3.5 w-3.5" />
                                        Like
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Bookmark className="mr-1 h-3.5 w-3.5" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-text-tertiary">
                        <div className="text-center">
                            <Building2 className="mx-auto mb-2 h-8 w-8" />
                            <p className="text-sm">Select a property to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==============================================================
// === ГЛАВНЫЙ КОМПОНЕНТ ДЕМО ===
// ==============================================================

export function DemoChatScreen() {
    const [layout, setLayout] = useState<ChatLayout>('telegram');
    const [cardVariant, setCardVariant] = useState<CardVariant>('compact');
    const [messages, setMessages] = useState<DemoMessage[]>(() => generateDemoMessages());
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationCounter = useRef(0);

    // Автосимуляция новых сообщений каждые 5 секунд
    useEffect(() => {
        if (!isSimulating) return;

        const filterNames = [
            'Barcelona Center',
            'Gracia Budget',
            'Eixample Premium',
            'Gothic Quarter',
            'Sarrià Family',
        ];

        const interval = setInterval(() => {
            simulationCounter.current += 1;
            const idx = 500 + simulationCounter.current;

            const newMsg: DemoMessage = {
                id: `sim_${idx}`,
                type: 'property',
                content: '',
                timestamp: new Date(),
                isOwn: false,
                property: generateMockProperty(idx),
                filterName: filterNames[idx % filterNames.length],
                isViewed: false,
                isNew: true,
            };

            setMessages((prev) => [...prev, newMsg]);
        }, 5000);

        return () => clearInterval(interval);
    }, [isSimulating]);

    const propertyCount = messages.filter((m) => m.type === 'property').length;

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
                {/* Заголовок */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">
                        Chat UI/UX Demo
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        3 layout variants × 6 property card designs
                    </p>
                </div>

                {/* Панель управления */}
                <div className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
                    {/* Выбор лейаута */}
                    <div>
                        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
                            Chat Layout
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(Object.entries(LAYOUT_LABELS) as [ChatLayout, string][]).map(
                                ([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setLayout(key)}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                            layout === key
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary',
                                        )}
                                    >
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Выбор варианта карточки */}
                    <div>
                        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
                            Property Card Variant
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(Object.entries(CARD_LABELS) as [CardVariant, string][]).map(
                                ([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setCardVariant(key)}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                            cardVariant === key
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary',
                                        )}
                                    >
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant={isSimulating ? 'destructive' : 'default'}
                            onClick={() => setIsSimulating(!isSimulating)}
                        >
                            {isSimulating ? (
                                <>
                                    <Pause className="mr-1.5 h-3.5 w-3.5" />
                                    Stop Simulation
                                </>
                            ) : (
                                <>
                                    <Play className="mr-1.5 h-3.5 w-3.5" />
                                    Start Simulation
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setMessages(generateDemoMessages());
                                simulationCounter.current = 0;
                            }}
                        >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Reset
                        </Button>
                        <Badge variant="secondary" className="ml-auto">
                            {propertyCount} properties · {messages.length} messages
                        </Badge>
                    </div>
                </div>

                {/* Рендер выбранного лейаута */}
                {layout === 'telegram' && (
                    <LayoutTelegram messages={messages} cardVariant={cardVariant} />
                )}
                {layout === 'feed' && (
                    <LayoutFeed messages={messages} cardVariant={cardVariant} />
                )}
                {layout === 'cards' && (
                    <LayoutSplitCards messages={messages} cardVariant={cardVariant} />
                )}
            </div>
        </div>
    );
}
