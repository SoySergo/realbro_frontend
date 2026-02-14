'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { toast } from 'sonner';
import { Link } from '@/shared/config/routing';
import {
    Check,
    Clock,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    StickyNote,
    Share2,
    Flag,
    Play,
    MapPin,
    Box,
    Train,
    Bus,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import type { PropertyHorizontalCard, PropertyHorizontalCardAuthor } from '../../model/card-types';
import { cn, safeImageSrc } from '@/shared/lib/utils';

interface PropertyCardHorizontalProps {
    property: PropertyHorizontalCard;
    onClick?: () => void;
    // Слот для дополнительных действий (например, кнопка сравнения)
    actions?: React.ReactNode;
}

/**
 * PropertyCardHorizontal - Горизонтальная карточка недвижимости с детальной информацией
 *
 * Используется в режиме списка для отображения объектов с расширенными деталями.
 * Показывает галерею, описание, информацию об агентстве и контакты.
 */
export function PropertyCardHorizontal({ property, onClick, actions }: PropertyCardHorizontalProps) {
    const t = useTranslations('property');
    const tTypes = useTranslations('propertyTypes');
    const tTransport = useTranslations('transport');
    const tActions = useTranslations('actions');

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Вычисление времени с момента публикации
    const timeAgo = useMemo(() => {
        const now = new Date();
        const created = new Date(property.created_at);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return t('minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('hoursAgo', { count: diffHours });
        return t('daysAgo', { count: diffDays });
    }, [property.created_at, t]);

    // Показываем максимум 6 секций для hover навигации
    const maxSections = Math.min(property.images.length, 6);
    const currentImageIndex = hoveredIndex !== null ? hoveredIndex : 0;
    const remainingPhotos = property.images.length - maxSections;

    // Превью медиа (видео, план, 3D тур, фото)
    const mediaThumbnails = useMemo(() => {
        const thumbnails: Array<{ type: string; src: string; label?: string }> = [];

        if (property.video) {
            thumbnails.push({ type: 'video', src: property.video.thumbnail, label: 'Video' });
        }

        if (property.floor_plan) {
            thumbnails.push({ type: 'floorPlan', src: property.floor_plan, label: 'Plan' });
        }

        if (property.tour_3d) {
            thumbnails.push({ type: 'tour3d', src: property.tour_3d.thumbnail, label: '3D' });
        }

        const remainingSlots = 3 - thumbnails.length;
        if (remainingSlots > 0 && property.images.length > 1) {
            property.images.slice(1, 1 + remainingSlots).forEach((img) => {
                thumbnails.push({ type: 'photo', src: img.url });
            });
        }

        return thumbnails.slice(0, 3);
    }, [property.video, property.floor_plan, property.tour_3d, property.images]);

    // Расширенная информация об авторе (если доступна)
    const authorAgencyLogo = property.author && 'agency_logo' in property.author ? (property.author as PropertyHorizontalCardAuthor).agency_logo : undefined;
    const authorAgencyName = property.author && 'agency_name' in property.author ? (property.author as PropertyHorizontalCardAuthor).agency_name : undefined;
    const authorIsSuperAgent = property.author && 'is_super_agent' in property.author ? (property.author as PropertyHorizontalCardAuthor).is_super_agent : undefined;
    const authorPhone = property.author && 'phone' in property.author ? (property.author as PropertyHorizontalCardAuthor).phone : undefined;

    const formatPrice = (price: number): string => {
        return `${price.toLocaleString('ru-RU')} €`;
    };

    const getTransportIcon = (type: string) => {
        switch (type) {
            case 'metro':
                return (
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: property.transport_station?.lines[0]?.color || '#E50914' }}
                    />
                );
            case 'train':
                return <Train className="w-3.5 h-3.5 flex-shrink-0" />;
            case 'bus':
                return <Bus className="w-3.5 h-3.5 flex-shrink-0" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex gap-6 py-6 border-b border-border cursor-pointer hover:bg-accent/5 transition-colors px-4" onClick={onClick}>
            {/* Галерея изображений */}
            <div className="flex-shrink-0 w-[375px]">
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        setHoveredIndex(null);
                    }}
                >
                    <Image
                        src={safeImageSrc(property.images[currentImageIndex]?.url)}
                        alt={property.images[currentImageIndex]?.alt || property.title}
                        width={375}
                        height={280}
                        className="w-full h-[280px] object-cover rounded"
                    />

                    {/* Hover секции для смены изображения */}
                    <div className="absolute inset-x-[15%] inset-y-0 flex">
                        {Array.from({ length: maxSections }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex-1 h-full"
                                onMouseEnter={() => setHoveredIndex(idx)}
                            />
                        ))}
                    </div>

                    {/* Overlay "Ещё N" */}
                    {isHovering && currentImageIndex === maxSections - 1 && remainingPhotos > 0 && (
                        <div className="absolute inset-0 bg-foreground/40 rounded flex items-center justify-center pointer-events-none">
                            <span className="text-background text-lg font-medium">
                                {t('viewMore', { count: remainingPhotos })}
                            </span>
                        </div>
                    )}

                    {/* Индикаторы секций */}
                    {isHovering && (
                        <div className="absolute bottom-3 left-3 right-3 flex gap-1">
                            {Array.from({ length: maxSections }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'h-0.5 flex-1 rounded-full transition-colors',
                                        idx === currentImageIndex ? 'bg-background' : 'bg-background/50'
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Счетчик фото */}
                    {!isHovering && (
                        <span className="absolute bottom-3 left-3 bg-foreground/70 text-background text-xs px-2 py-1 rounded">
                            1/{property.images.length}
                        </span>
                    )}
                </div>

                {/* Превью медиа */}
                <div className="flex gap-1.5 mt-2">
                    {mediaThumbnails.map((item, idx) => (
                        <button
                            key={idx}
                            className="relative w-[120px] h-[65px] rounded overflow-hidden group"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log(`Open ${item.type}`);
                            }}
                        >
                            <Image
                                src={safeImageSrc(item.src)}
                                alt={item.label || ''}
                                width={120}
                                height={65}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {item.type !== 'photo' && (
                                <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                                    {item.type === 'video' && <Play className="w-5 h-5 text-background" />}
                                    {item.type === 'floorPlan' && <MapPin className="w-5 h-5 text-background" />}
                                    {item.type === 'tour3d' && <Box className="w-5 h-5 text-background" />}
                                </div>
                            )}
                            {item.label && (
                                <span className="absolute bottom-1 left-1 text-[10px] text-background bg-foreground/60 px-1.5 py-0.5 rounded">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
                <a
                    href="#"
                    className="text-base font-medium text-primary hover:underline block mb-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {property.title}
                </a>
                <p className="text-sm text-muted-foreground mb-2">
                    {property.rooms} {t('roomsShort')} • {property.area} м²
                    {property.floor && property.total_floors && (
                        <> • {t('floorOf', { floor: property.floor, total: property.total_floors })}</>
                    )}
                </p>

                {/* Badges */}
                <div className="flex gap-2 mb-2">
                    {authorIsSuperAgent && (
                        <Badge variant="success" className="text-xs py-0.5">
                            <Check className="w-3 h-3 mr-1" />
                            {t('agent')}
                        </Badge>
                    )}
                    {property.no_commission && (
                        <Badge variant="outline" className="text-xs py-0.5">
                            Без комиссии
                        </Badge>
                    )}
                    {property.exclusive && (
                        <Badge variant="primary" className="text-xs py-0.5">
                            Эксклюзив
                        </Badge>
                    )}
                </div>

                {/* Транспорт */}
                {property.transport_station && (
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-1.5">
                            {getTransportIcon(property.transport_station.type)}
                            <span className="text-sm">{property.transport_station.station_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {t('walkMin', { min: property.transport_station.walk_minutes })}
                        </div>
                    </div>
                )}

                {/* Адрес */}
                <p className="text-sm text-muted-foreground mb-2">{property.address}</p>

                {/* Цена */}
                <p className="text-lg font-semibold mb-2">{formatPrice(property.price)}/мес</p>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {property.amenities.slice(0, 4).map((amenity, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-muted text-foreground px-2 py-1 rounded"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                )}

                {/* Описание */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {property.description}
                </p>
            </div>

            {/* Агентство и действия */}
            <div className="flex-shrink-0 w-[180px]">
                {property.author && (
                    <div className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-center mb-2">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={safeImageSrc(authorAgencyLogo || property.author.avatar)} />
                                <AvatarFallback>
                                    {property.author.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mb-0.5 uppercase tracking-wide">
                            {property.author.type === 'agency' ? t('agency') : property.author.type === 'agent' ? t('agent') : t('owner')}
                        </p>
                        <Link
                            href={`/agency/${property.author.id}`}
                            className="text-sm font-medium text-center mb-1.5 block hover:text-brand-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {authorAgencyName || property.author.name}
                        </Link>
                        {property.author.is_verified && (
                            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-2">
                                <Check className="w-3 h-3 text-primary" />
                                {t('verified')}
                            </div>
                        )}
                        {authorPhone && (
                            <Button className="w-full mb-1.5 text-xs h-8" size="sm">
                                {authorPhone}
                            </Button>
                        )}
                        <Button variant="ghost" className="w-full text-primary text-xs h-7" size="sm">
                            Написать
                        </Button>
                    </div>
                )}

                {/* Панель действий */}
                <div className="flex items-center justify-center gap-3 mt-3">
                    {/* Слот для дополнительных действий (например, сравнение) */}
                    {actions}
                    <button
                        className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-500/10 rounded transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.success(tActions('liked'), { duration: 2000 });
                        }}
                        title={t('like')}
                    >
                        <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            toast(tActions('disliked'), { duration: 2000 });
                        }}
                        title={t('dislike')}
                    >
                        <ThumbsDown className="w-5 h-5" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <StickyNote className="w-4 h-4" />
                                {t('addNote')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Share2 className="w-4 h-4" />
                                {t('share')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-destructive"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Flag className="w-4 h-4" />
                                {t('report')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <p className="text-[11px] text-muted-foreground text-right mt-2">{timeAgo}</p>
            </div>
        </div>
    );
}
