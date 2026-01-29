'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Train, Bus } from 'lucide-react';
import type { NearbyTransport } from '@/entities/property/model/types';

// Metro icon component
function MetroIcon({ className }: { className?: string }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={cn('w-4 h-4', className)}
        >
            <path d="M12 2L4 10v8h4v-6h8v6h4v-8L12 2zm0 2.5L17.5 10h-11L12 4.5z"/>
        </svg>
    );
}

interface PropertyTransportListProps {
    transports: NearbyTransport[];
    maxItems?: number;
    className?: string;
}

export function PropertyTransportList({
    transports,
    maxItems = 5,
    className
}: PropertyTransportListProps) {
    const t = useTranslations('propertyDetail');

    if (!transports.length) return null;

    const displayedTransports = transports.slice(0, maxItems);

    const getTransportIcon = (type: NearbyTransport['type']) => {
        switch (type) {
            case 'metro':
                return MetroIcon;
            case 'train':
                return Train;
            case 'bus':
                return Bus;
            default:
                return Train;
        }
    };

    // Common metro line colors for Moscow/Spain
    const getLineColor = (color?: string, line?: string) => {
        if (color) return color;
        
        // Default colors based on line names/numbers
        const defaultColors: Record<string, string> = {
            '1': '#EF1E25',  // Red
            '2': '#44B85C',  // Green
            '3': '#0078BF',  // Blue
            '4': '#19C1F3',  // Light blue
            '5': '#894E35',  // Brown
            '6': '#F58220',  // Orange
            '7': '#8E479C',  // Purple
            '8': '#FFD803',  // Yellow
            '9': '#A1A2A3',  // Gray
            '10': '#B3D445', // Lime
            '11': '#79CDCD', // Teal
            '12': '#ACBFE1', // Light gray-blue
        };

        return defaultColors[line || '1'] || '#0078BF';
    };

    return (
        <div className={cn('space-y-2', className)}>
            {displayedTransports.map((transport, index) => {
                const Icon = getTransportIcon(transport.type);
                const lineColor = getLineColor(transport.color, transport.line);

                return (
                    <div 
                        key={index}
                        className="flex items-center gap-2 text-sm"
                    >
                        {/* Metro line color indicator */}
                        {transport.type === 'metro' ? (
                            <div 
                                className="flex items-center justify-center w-5 h-5 rounded-full"
                                style={{ backgroundColor: lineColor }}
                            >
                                <MetroIcon className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-5 h-5 text-muted-foreground">
                                <Icon className="w-4 h-4" />
                            </div>
                        )}

                        {/* Station name */}
                        <span className="font-medium text-foreground flex-1">
                            {transport.name}
                        </span>

                        {/* Walk time */}
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                            <WalkIcon className="w-3 h-3" />
                            {transport.walkMinutes} {t('walkMinutes', { min: '' }).replace('{min}', '').trim()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// Walk icon
function WalkIcon({ className }: { className?: string }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="4" r="2"/>
            <path d="M15 22v-4l-3-3 2-4 3 3h3"/>
            <path d="M9 22l2-8-3-3 3-3"/>
        </svg>
    );
}
