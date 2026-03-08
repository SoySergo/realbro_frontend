'use client';

import { useEffect, useState } from 'react';
import { type PropertyGridCard } from '@/entities/property';
import { getPropertiesByIds } from '@/shared/api';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/entities/property';

interface PropertyPopupContentProps {
    propertyId: string;
    onClose?: () => void;
}

export function PropertyPopupContent({ propertyId, onClose }: PropertyPopupContentProps) {
    const t = useTranslations('property');
    const [property, setProperty] = useState<PropertyGridCard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getPropertiesByIds([propertyId])
            .then(res => {
                if (mounted && res && res.length > 0) {
                    setProperty(res[0]);
                }
            })
            .catch((err) => {
                console.error('[PropertyPopupContent] Failed to fetch property details:', err);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
            
        return () => {
            mounted = false;
        };
    }, [propertyId]);

    if (loading) {
        return (
            <div className="w-[260px] h-[280px] flex items-center justify-center bg-background rounded-xl shadow-lg border relative">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                {onClose && (
                    <button className="absolute top-2 right-2 flex items-center justify-center h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors" onClick={onClose} aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }

    if (!property) {
        return (
            <div className="w-[260px] h-[100px] flex items-center justify-center p-4 text-center text-text-secondary bg-background rounded-xl shadow-lg border relative">
                {t('errors.not_found')}
                {onClose && (
                    <button className="absolute top-1 right-1 flex items-center justify-center h-6 w-6 rounded-md hover:bg-background-secondary transition-colors" onClick={onClose} aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }

    const { title, price, price_per_m2, area, rooms, bathrooms, images, author, is_new } = property;
    const coverImage = images && images.length > 0 ? getImageUrl(images[0]) : null;

    const formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: property.currency || 'EUR',
        maximumFractionDigits: 0
    }).format(price || 0);

    const mainCharText = [
        rooms ? `${rooms} ${t('roomsShort')}` : null,
        bathrooms ? `${bathrooms} ${t('bathroomsShort')}` : null,
        area ? `${area} m²` : null,
    ].filter(Boolean).join(' · ');

    return (
        <div className="w-[260px] h-[280px] bg-background rounded-xl overflow-hidden shadow-xl border flex flex-col relative animate-fade-in cursor-pointer" onClick={(e: React.MouseEvent) => {
            // Prevent map click when clicking card
            e.stopPropagation();
        }}>
            {/* Изображение */}
            <div className="relative h-[160px] w-full bg-background-secondary shrink-0">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="260px"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">{t('images.no_photo')}</span>
                    </div>
                )}
                
                {/* Бейджи */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                    {is_new && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-sm bg-brand-primary text-white backdrop-blur-sm">
                            {t('badges.new_development')}
                        </span>
                    )}
                </div>

                {/* Кнопка закрытия (поверх картинки, скругленная) */}
                {onClose && (
                    <button 
                        className="absolute top-2 right-2 flex items-center justify-center z-20 h-7 w-7 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors" 
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Контент */}
            <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-lg text-text-primary leading-none">
                            {formattedPrice}
                        </div>
                    </div>
                    
                    <div className="text-xs text-text-secondary truncate mb-1.5">
                        {mainCharText}
                    </div>
                    
                    <div className="text-sm font-medium text-text-primary line-clamp-1 mb-2">
                        {title}
                    </div>
                </div>

                {/* Низ карточки: автор слева (новшество) */}
                <div className="flex items-center justify-between pt-2 border-t mt-auto">
                    {author ? (
                        <div className="flex items-center text-xs text-text-secondary">
                            {((author as any).avatar || (author as any).logo_url || (author as any).avatar_url) ? (
                                <div className="w-5 h-5 rounded-full overflow-hidden mr-1.5 border relative shrink-0">
                                    <Image src={(author as any).avatar || (author as any).logo_url || (author as any).avatar_url} alt={author.name} fill className="object-cover" sizes="20px" />
                                </div>
                            ) : null}
                            <span className="truncate max-w-[150px] font-medium">{author.name}</span>
                        </div>
                    ) : (
                        <div />
                    )}
                    {price_per_m2 && (
                        <div className="text-[10px] text-text-tertiary">
                            {price_per_m2} €/м²
                        </div>
                    )}
                </div>
            </div>

            {/* Link overlay */}
            <Link href={`/property/${property.slug || property.id}`} className="absolute inset-0 z-0" aria-label={title} target="_blank" />
        </div>
    );
}
