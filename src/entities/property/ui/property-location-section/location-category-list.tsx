import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { 
    MapPin, 
    Clock, 
    Phone, 
    Globe, 
    Star,
    Utensils,
    Banknote,
    Pill,
    Stethoscope,
    School,
    GraduationCap,
    Baby,
    ShoppingCart,
    ShoppingBag,
    Croissant,
    Book,
    Flower,
    Coffee,
    Wine,
    Scissors,
    Sparkles,
    Landmark,
    Trees,
    Dumbbell,
    Film,
    Camera,
    Palette,
    Music,
    Clapperboard,
    Swords,
    Ticket,
    Armchair,
    Mic2,
    Building2,
    Store
} from 'lucide-react';
import { HorizontalScrollWithFade } from '@/shared/ui/horizontal-scroll/with-fade';

export interface LocationCategoryItem {
    id: string;
    name: string;
    type: string;
    distance: string;
    category?: string;
    // Enhanced OSM Data
    address?: string;
    openingHours?: string;
    phone?: string;
    website?: string;
    rating?: number;
    priceLevel?: 1 | 2 | 3 | 4; // 1 = $, 2 = $$, etc.
    cuisine?: string;
}

interface LocationCategoryListProps {
    items: LocationCategoryItem[];
    className?: string;
}

export function LocationCategoryList({ items, className }: LocationCategoryListProps) {
    const t = useTranslations('propertyDetail.locationSection');

    if (!items?.length) return null;

    const renderPriceLevel = (level: number) => {
        return (
            <span className="flex text-xs tracking-widest text-muted-foreground" title={`Price level: ${level}/4`}>
                {[...Array(4)].map((_, i) => (
                    <span key={i} className={i < level ? "text-foreground font-medium" : ""}>$</span>
                ))}
            </span>
        );
    };

    const getIconByType = (type: string, category?: string) => {
        const t = type.toLowerCase();
        
        // Medical
        if (t.includes('pharmacy')) return <Pill className="w-4 h-4" />;
        if (t.includes('hospital')) return <Building2 className="w-4 h-4" />;
        if (t.includes('clinic') || t.includes('doctor') || t.includes('dentist')) return <Stethoscope className="w-4 h-4" />;
        
        // Education
        if (t.includes('university')) return <GraduationCap className="w-4 h-4" />;
        if (t.includes('kindergarten')) return <Baby className="w-4 h-4" />;
        if (t.includes('school')) return <School className="w-4 h-4" />;

        // Shops
        if (t.includes('grocery') || t.includes('supermarket')) return <ShoppingCart className="w-4 h-4" />;
        if (t.includes('bakery')) return <Croissant className="w-4 h-4" />;
        if (t.includes('book')) return <Book className="w-4 h-4" />;
        if (t.includes('florist') || t.includes('flower')) return <Flower className="w-4 h-4" />;
        if (t.includes('clothing') || t.includes('department')) return <ShoppingBag className="w-4 h-4" />;
        if (t.includes('shop') || t.includes('store')) return <Store className="w-4 h-4" />;

        // Food
        if (t.includes('cafe') || t.includes('coffee')) return <Coffee className="w-4 h-4" />;
        if (t.includes('bar') || t.includes('pub')) return <Wine className="w-4 h-4" />;
        if (t.includes('restaurant')) return <Utensils className="w-4 h-4" />;

        // Beauty
        if (t.includes('hair') || t.includes('barber')) return <Scissors className="w-4 h-4" />;
        if (t.includes('spa') || t.includes('salon')) return <Sparkles className="w-4 h-4" />;

        // Recreation & Attractions
        if (t.includes('gym') || t.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
        if (t.includes('boxing') || t.includes('fight')) return <Swords className="w-4 h-4" />;
        if (t.includes('cinema') || t.includes('movie')) return <Clapperboard className="w-4 h-4" />;
        if (t.includes('theater') || t.includes('theatre')) return <Armchair className="w-4 h-4" />;
        if (t.includes('gallery') || t.includes('art') || t.includes('museum')) return <Palette className="w-4 h-4" />;
        if (t.includes('music') || t.includes('jazz') || t.includes('concert') || t.includes('dance')) return <Music className="w-4 h-4" />;
        
        if (t.includes('park') || t.includes('garden')) return <Trees className="w-4 h-4" />;
        if (t.includes('landmark') || t.includes('monument')) return <Landmark className="w-4 h-4" />;

        // Fallback by category
        if (category === 'restaurants') return <Utensils className="w-4 h-4" />;
        
        return <MapPin className="w-4 h-4" />;
    };

    return (
        <HorizontalScrollWithFade 
            className={cn("-mx-4 sm:mx-0", className)}
            hideButtons={false}
            scrollAmount={664}
        >
            <div className="flex gap-2 sm:gap-3 px-4 sm:px-0">
                {items.map((item) => (
                    <div 
                        key={item.id}
                        className="flex-none w-[280px] sm:w-[320px] flex flex-col p-3 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all sm:min-h-[120px] justify-between snap-start"
                    >
                        <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        {getIconByType(item.type, item.category)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium truncate" title={item.name}>
                                                {item.name}
                                            </div>
                                            {item.rating && (
                                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-600 text-[10px] font-medium shrink-0">
                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                    {item.rating}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="truncate">{item.type}</span>
                                            {item.cuisine && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">{item.cuisine}</span>
                                                </>
                                            )}
                                            {item.priceLevel && (
                                                <>
                                                    <span>•</span>
                                                    {renderPriceLevel(item.priceLevel)}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="shrink-0 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md whitespace-nowrap">
                                    {item.distance}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 pt-1">
                                {item.address && (
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1" title={item.address}>{item.address}</span>
                                    </div>
                                )}
                                
                                {item.openingHours && (
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1" title={item.openingHours}>{item.openingHours}</span>
                                    </div>
                                )}

                                {(item.phone || item.website) && (
                                    <div className="flex items-center gap-3 pt-1 mt-1 border-t border-border/50">
                                        {item.phone && (
                                            <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                <Phone className="w-3 h-3" />
                                                <span>Call</span>
                                            </a>
                                        )}
                                        {item.website && (
                                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                <Globe className="w-3 h-3" />
                                                <span>Website</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </HorizontalScrollWithFade>
    );
}
