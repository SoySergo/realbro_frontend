'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

// Layout constants
const SCROLL_THRESHOLD = 50; // px to trigger header state change
const INTERSECTION_OFFSET = 300; // px offset for section detection
const HEADER_HEIGHT = 60; // px height of sticky header
const SUB_HEADER_HEIGHT = 52; // px height of subHeader variant

// Общий стиль «островка»
const ISLAND_CLASS = "flex items-center h-9 rounded-full bg-background border border-border shadow-sm";

export interface HeaderTranslations {
    back: string;
    navPhotos: string;
    navMedia: string;
    navDescription: string;
    navCharacteristics: string;
    navMap: string;
    previous: string;
    next: string;
}

interface MainInfoTranslations {
    sqm: string;
    floor: string;
    rooms: string;
    roomsShort: string;
    livingArea: string;
    kitchenArea: string;
    ceilingHeight: string;
    bathrooms: string;
    area: string;
    pricePerMeter: string;
}

interface PropertyDetailHeaderProps {
    className?: string;
    hasListingContext?: boolean;
    currentListingIndex?: number;
    totalListingCount?: number;
    price?: number;
    area?: number;
    rooms?: number;
    title?: string;
    floor?: number;
    currency?: string;
    translations: HeaderTranslations;
    mainInfoTranslations: MainInfoTranslations;
    locale?: string;
    /** Режим рендера: по умолчанию — полный fixed header, 'headerSlot' — встроен в AppHeader, 'subHeader' — второй уровень навигации */
    variant?: 'default' | 'headerSlot' | 'subHeader';
}

// Get Intl locale from app locale
const getIntlLocale = (locale?: string): string => {
    switch (locale) {
        case 'ru': return 'ru-RU';
        case 'fr': return 'fr-FR';
        case 'en': return 'en-US';
        default: return 'en-US';
    }
};

// Порядок навигации по секциям
const SECTION_IDS = ['photos', 'characteristics', 'description', 'map'] as const;

export function PropertyDetailHeader({
    className,
    hasListingContext = true,
    currentListingIndex = 1,
    totalListingCount = 600,
    price,
    area,
    rooms,
    title,
    floor,
    currency = '€',
    translations: t,
    mainInfoTranslations,
    locale,
    variant = 'default',
}: PropertyDetailHeaderProps) {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('photos');

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > SCROLL_THRESHOLD);

            // Simple intersection detection
            for (const section of SECTION_IDS) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // If top is near viewport top (with some offset)
                    if (rect.top >= 0 && rect.top < INTERSECTION_OFFSET) {
                        // setActiveSection(section);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - HEADER_HEIGHT,
                behavior: 'smooth'
            });
        }
    };

    // Лейблы навигации по секциям, используя общий порядок SECTION_IDS
    const sectionLabels: Record<string, string> = {
        photos: t.navMedia,
        characteristics: t.navCharacteristics,
        description: t.navDescription,
        map: t.navMap,
    };
    const navItems = SECTION_IDS.map(id => ({ id, label: sectionLabels[id] }));


    const intlLocale = getIntlLocale(locale);
    const formattedPrice = price ? new Intl.NumberFormat(intlLocale).format(price) : '';
    const pricePerMeter = price && area ? Math.round(price / area) : null;

    // Режим subHeader — второй уровень навигации под основным хедером
    if (variant === 'subHeader') {
        return (
            <div className={cn(
                `grid grid-cols-3 items-center w-full h-[${SUB_HEADER_HEIGHT}px] px-4`,
                className
            )}>
                {/* Островок «Назад» */}
                <div className="flex items-center justify-self-start">
                    <button
                        onClick={() => router.back()}
                        className={cn(ISLAND_CLASS, "px-3.5 gap-1.5 text-sm font-medium text-foreground hover:bg-muted hover:shadow-md transition-all active:scale-95")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.back}
                    </button>
                </div>

                {/* Островок навигации по секциям (px-1 создаёт отступ вокруг внутренних кнопок) */}
                <nav className={cn(ISLAND_CLASS, "px-1 justify-self-center")}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                                "px-3.5 py-1 rounded-full text-sm font-medium transition-all",
                                activeSection === item.id
                                    ? "bg-brand-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Островок «Предыдущий / Следующий» (px-1 — отступ вокруг кнопок) */}
                <div className="flex items-center justify-self-end">
                    {hasListingContext && (
                        <div className={cn(ISLAND_CLASS, "px-1")}>
                            <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all active:scale-95">
                                <ChevronLeft className="w-4 h-4" />
                                {t.previous}
                            </button>
                            <div className="w-px h-4 bg-border" />
                            <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all active:scale-95">
                                {t.next}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Режим headerSlot — встроенный контент без собственного fixed-обёртки
    if (variant === 'headerSlot') {
        return (
            <div className={cn("grid grid-cols-3 items-center w-full h-full px-2", className)}>
                {/* Кнопка назад */}
                <div className="flex items-center justify-self-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full transition-all h-9 w-9 active:scale-95 hover:bg-brand-primary-light text-brand-primary"
                        title={t.back}
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                    </Button>
                </div>

                {/* Навигация по секциям */}
                <nav className="flex items-center gap-1 bg-background/50 backdrop-blur-sm p-1 rounded-full border border-border/10 shadow-sm justify-self-center">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                                activeSection === item.id
                                    ? "bg-brand-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Навигация по листингу */}
                <div className="flex items-center justify-self-end">
                    {hasListingContext ? (
                        <div className="flex items-center gap-2 p-1 rounded-full transition-all">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                                title={t.previous}
                            >
                                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                                title={t.next}
                            >
                                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="text-brand-primary h-9 w-9">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Режим default — полный fixed-хедер (мобильная версия)
    return (
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[60px] flex items-center bg-background/95 backdrop-blur-md border-b border-border shadow-sm",
                className
            )}
        >
            <div className="container mx-auto px-2 md:px-6 flex items-center justify-between h-full gap-2">
                {/* Left: Back Button */}
                <div className="flex items-center shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full transition-all h-10 w-10 active:scale-95 hover:bg-brand-primary-light text-brand-primary"
                        title={t.back}
                    >
                        <ArrowLeft className="w-7 h-7" strokeWidth={2.5} />
                    </Button>
                </div>

                {/* Mobile Info */}
                <div className="flex-1 relative h-full mx-2 ">
                     {/* Logo State (Not Scrolled) */}
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-start transition-all duration-200",
                        !isScrolled ? "opacity-100 translate-y-0 " : "opacity-0 -translate-y-2 pointer-events-none"
                    )}>
                        <Image
                            src="/logo.svg"
                            alt="Realbro"
                            width={28}
                            height={28}
                            className="w-7 h-7 object-contain"
                        />
                        <span className="ml-2 mt-1 text-2xl font-bold leading-none">Realbro</span>
                    </div>

                    {/* Property Info State (Scrolled) */}
                    <div className={cn(
                        "absolute inset-0 flex flex-col justify-center items-start transition-all duration-200",
                        isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    )}>
                        {/* Top Row: Title */}
                        <div className="w-full text-left">
                            <div className="text-sm font-bold leading-tight truncate text-foreground/90">
                                {title}
                            </div>
                        </div>
                        
                        {/* Bottom Row: Specs + Price */}
                        <div className="flex items-center justify-start text-[11px] leading-tight mt-0.5 font-medium whitespace-nowrap overflow-hidden">
                             {price && (
                                <div className="text-sm font-bold text-brand-primary mr-3 shrink-0">
                                    {formattedPrice} {currency}
                                </div>
                            )}
                            <div className="flex items-center text-muted-foreground truncate">
                                {rooms && <span>{rooms} {mainInfoTranslations.roomsShort}</span>}
                                {rooms && area && <span className="mx-1.5">•</span>}
                                {area && <span>{area} {mainInfoTranslations.sqm}</span>}
                                {floor && (
                                    <>
                                        <span className="mx-1.5">•</span>
                                        <span>{floor} {mainInfoTranslations.floor}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Listing Navigation or Actions */}
                <div className="flex items-center justify-end shrink-0">
                    {hasListingContext ? (
                         <div className="flex items-center gap-4 p-1 rounded-full transition-all">
                             <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-10 w-10 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                                 title={t.previous}
                             >
                                 <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
                             </Button>
                             <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-10 w-10 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                                 title={t.next}
                             >
                                 <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
                             </Button>
                         </div>
                    ) : (
                        <div className="flex gap-2">
                             {/* Fallback actions if no listing context */}
                             <Button variant="ghost" size="icon" className="text-brand-primary">
                                <Share2 className="w-6 h-6" />
                             </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}