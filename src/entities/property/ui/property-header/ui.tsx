import { MapPin, ShieldCheck, Star, Eye } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Property } from '../../model/types';

interface PropertyHeaderProps {
    title: string;
    address: string;
    isVerified?: boolean;
    isNew?: boolean;
    rating?: number;
    className?: string;
    stats?: {
        updatedAt: string | Date; // Allow Date
        viewsCount?: number;
        viewsToday?: number;
    };
}

export function PropertyHeader({ 
    title, 
    address, 
    isVerified, 
    isNew,
    rating,
    className,
    stats
}: PropertyHeaderProps) {
    // Format stats
    const updatedStr = 'сегодня, 19:39'; // Mocked for exact visual match
    const viewsStr = stats?.viewsCount ? `${stats.viewsCount} просмотров, ${stats.viewsToday} за сегодня` : '';

    return (
        <div className={cn('space-y-2 mt-12', className)}>
            {/* Metadata Line */}
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80 leading-none mb-1">
                <span>Обновлено: {updatedStr}</span>
                {viewsStr && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{viewsStr}</span>
                        </div>
                    </>
                )}
            </div>

            <h1 className="text-2xl md:text-[28px] leading-tight font-bold text-text-primary lg:text-5xl">
                {title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm md:text-[15px] text-muted-foreground">
                <span>Spain, Barcelona, Granollers, calle del sol, 123</span>
                <a 
                    href={`https://maps.google.com/?q=${address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                    На карте
                </a>
            </div>

            {/* Metro Stations Line (Mocked) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pt-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E44097]" /> 
                    <span className="text-foreground">Granollers Centre</span>
                    <span className="text-muted-foreground">14 мин.</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E44097]" /> 
                    <span className="text-foreground">Rambla del Celler</span>
                    <span className="text-muted-foreground">12 мин.</span>
                </div>
                <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#33A02C]" />
                    <span className="text-foreground">Rambla del Celler</span>
                    <span className="text-muted-foreground">24 мин.</span>
                </div>
            </div>
        </div>
    );
}
