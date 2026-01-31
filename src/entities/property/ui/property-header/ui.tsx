import { MapPin, ShieldCheck, Star, Eye } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Property } from '../../model/types';
import { PropertyAddressWithTransport } from '../property-address-transport';
import { mockBarcelonaStations } from '../property-address-transport/transport-stations';

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
            
            {/* Address and Transport */}
            <div className="mt-4">
                <PropertyAddressWithTransport 
                    address={address}
                    country="Испания"
                    region="Каталония"
                    province="Барселона"
                    city="Барселона"
                    district="Эшампле"
                    // street part is inside address prop currently or we splits it. 
                    // user example was "...Eixample, {address}" where address likely was just street/house
                    stations={mockBarcelonaStations}
                    showMapButton={true}
                    onMapClick={() => {
                        const mapSection = document.getElementById('property-map-section');
                        if (mapSection) {
                            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                />
            </div>
        </div>
    );
}
