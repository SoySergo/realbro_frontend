
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Heart, ThumbsDown } from 'lucide-react';

interface PropertyDetailHeaderProps {
    className?: string;
    hasListingContext?: boolean; // If true, shows listing navigation
    currentListingIndex?: number;
    totalListingCount?: number;
}

export function PropertyDetailHeader({
    className,
    hasListingContext = true, // Defaulting to true for demo as requested
    currentListingIndex = 1,
    totalListingCount = 600
}: PropertyDetailHeaderProps) {
    const t = useTranslations('propertyDetail');
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('photos');

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 50);

            // Simple intersection detection (could be improved with IntersectionObserver)
            const sections = ['photos', 'description', 'characteristics', 'map'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // If top is near viewport top (with some offset)
                    if (rect.top >= 0 && rect.top < 300) {
                        // setActiveSection(section); // This logic might feel jumpy, simplified for now
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
            const offset = 60; // height of sticky header
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
    };

    const navItems = [
        { id: 'photos', label: t('navPhotos') },
        { id: 'description', label: t('navDescription') },
        { id: 'characteristics', label: t('navCharacteristics') },
        { id: 'map', label: t('navMap') },
    ];

    return (
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[52px] flex items-center",
                isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent",
                className
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-full">
                {/* Left: Back Button */}
                <div className="flex items-center gap-4 flex-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()}
                        className={cn("rounded-full", !isScrolled && "bg-background/20 hover:bg-background/40 text-foreground backdrop-blur-sm")}
                        title={t('back')}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </div>

                {/* Center: Section Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-background/50 backdrop-blur-sm p-1 rounded-full border border-border/10 shadow-sm">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                activeSection === item.id 
                                    ? "bg-blue-600 text-white shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Mobile Actions (Center) */}
                <div className="flex md:hidden items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
                        <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
                        <ThumbsDown className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>

                {/* Right: Listing Navigation or Actions */}
                <div className="flex items-center justify-end gap-2 flex-1">
                    {hasListingContext ? (
                         <div className={cn(
                             "flex items-center gap-2 p-1 rounded-full transition-all",
                             isScrolled ? "bg-muted/50" : "bg-background/20 backdrop-blur-sm"
                         )}>
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                 <ChevronLeft className="w-4 h-4" />
                             </Button>
                             <span className="text-sm font-medium px-2 min-w-[60px] text-center">
                                 {currentListingIndex} / {totalListingCount}
                             </span>
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                 <ChevronRight className="w-4 h-4" />
                             </Button>
                         </div>
                    ) : (
                        <div className="flex gap-2">
                             {/* Fallback actions if no listing context */}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
