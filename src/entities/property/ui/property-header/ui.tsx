import { Eye } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { PropertyAddressWithTransport } from '../property-address-transport';
import type { TransportStation } from '../property-address-transport/transport-stations';

interface PropertyHeaderTranslations {
    updated: string;
    views: string;
    viewsToday: string;
}

interface LocationData {
    country?: string;
    region?: string;
    province?: string;
    city?: string;
    district?: string;
}

interface PropertyHeaderProps {
    title: string;
    address: string;
    isVerified?: boolean;
    isNew?: boolean;
    rating?: number;
    className?: string;
    stats?: {
        updatedAt: string | Date;
        viewsCount?: number;
        viewsToday?: number;
    };
    location?: LocationData;
    stations?: TransportStation[];
    translations?: PropertyHeaderTranslations;
}

// Helper to format relative time
function formatUpdatedTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
        return `${diffMins} min ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays === 1) {
        return 'yesterday';
    } else {
        return d.toLocaleDateString();
    }
}

export function PropertyHeader({
    title,
    address,
    className,
    stats,
    location,
    stations = [],
    translations
}: PropertyHeaderProps) {
    const updatedStr = stats?.updatedAt ? formatUpdatedTime(stats.updatedAt) : '';
    const viewsLabel = translations?.views ?? 'views';
    const viewsTodayLabel = translations?.viewsToday ?? 'today';
    const updatedLabel = translations?.updated ?? 'Updated';

    const viewsStr = stats?.viewsCount
        ? `${stats.viewsCount} ${viewsLabel}, ${stats.viewsToday ?? 0} ${viewsTodayLabel}`
        : '';

    return (
        <div className={cn('space-y-2 mt-12', className)}>
            {/* Metadata Line */}
            {(updatedStr || viewsStr) && (
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80 leading-none mb-1">
                    {updatedStr && <span>{updatedLabel}: {updatedStr}</span>}
                    {viewsStr && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{viewsStr}</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            <h1 className="text-2xl md:text-[28px] leading-tight font-bold text-text-primary lg:text-5xl">
                {title}
            </h1>

            {/* Address and Transport */}
            <div className="mt-4">
                <PropertyAddressWithTransport
                    address={address}
                    country={location?.country}
                    region={location?.region}
                    province={location?.province}
                    city={location?.city}
                    district={location?.district}
                    stations={stations}
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
