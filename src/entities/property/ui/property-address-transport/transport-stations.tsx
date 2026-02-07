import { cn } from '@/shared/lib/utils';
import { Footprints, Car, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HorizontalScrollWithFade } from '@/shared/ui/horizontal-scroll/with-fade';

export type TransportMode = 'metro' | 'train' | 'tram' | 'bus';

export interface TransportLine {
    id: string;
    type: TransportMode;
    name: string;
    color?: string;
    textColor?: string;
    destination?: string;
}

export interface TransportStation {
    id: string;
    name: string;
    lines: TransportLine[];
    distance: number; // minutes
    isWalk: boolean; // true for walk, false for transport
}

interface TransportStationsProps {
    stations: TransportStation[];
    className?: string;
}

// -----------------------------------------------------------------------------------------
// COMPACT VERSION (For Header / Address Section)
// -----------------------------------------------------------------------------------------
export function TransportStations({ stations, className }: TransportStationsProps) {
    const t = useTranslations('propertyDetail');

     const getPriority = (type: TransportMode) => {
        switch (type) {
            case 'metro': return 0;
            case 'train': return 0; // Same priority as metro
            case 'tram': return 1;
            case 'bus': return 2;
            default: return 3;
        }
    };

    return (
        <div className={cn("flex flex-wrap gap-x-6 gap-y-3", className)}>
            {stations.map((station) => {
                // Sort lines by priority and then take top 3
                const sortedLines = [...station.lines].sort((a, b) => {
                    const pA = getPriority(a.type);
                    const pB = getPriority(b.type);
                    return pA - pB;
                }).slice(0, 3);

                return (
                    <div key={station.id} className="flex items-center gap-2 text-sm text-foreground">
                        {/* Lines Icons */}
                        <div className="flex items-center gap-1.5">
                            {sortedLines.map((line, idx) => (
                                <TransportLineIcon key={`${station.id}-${line.id}-${idx}`} line={line} />
                            ))}
                        </div>

                        {/* Station Name */}
                        <span className="font-normal whitespace-nowrap">
                            {station.name}
                        </span>

                        {/* Distance and Mode */}
                        <span className="text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            {station.distance} {t('min')}
                            {station.isWalk ? (
                                <Footprints className="w-3.5 h-3.5" />
                            ) : (
                                <Car className="w-3.5 h-3.5" />
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------------------------
// DETAILED VERSION (For Location List / Bottom Section)
// -----------------------------------------------------------------------------------------
export function TransportStationsDetailed({ stations, className }: TransportStationsProps) {
    const t = useTranslations('propertyDetail');
    // Import will be added at the top in a separate edit if needed, but assuming I can't edit top here easily without reading full file.
    // Wait, I can't check if import exists easily.
    // I will just use the replace_file_content on the whole file or robust chunk.
    
     const getPriority = (type: TransportMode) => {
        switch (type) {
            case 'metro': return 0;
            case 'train': return 0; // Same priority as metro
            case 'tram': return 1;
            case 'bus': return 2;
            default: return 3;
        }
    };

    // Need to verify HorizontalScroll import. It is NOT imported in the file currently (checked previous `view_file`).
    // So I need to add the import first or use a larger chunk.
    // I'll assume I need to handle the import.
    
    return (
        <HorizontalScrollWithFade 
            className={cn("-mx-4 sm:mx-0", className)}
            hideButtons={false}
            scrollAmount={664}
        >
            <div className="flex gap-3 pl-[10px] pr-0 sm:px-0">
                {stations.map((station) => {
                    // Sort lines by priority
                    const sortedLines = [...station.lines].sort((a, b) => {
                        const pA = getPriority(a.type);
                        const pB = getPriority(b.type);
                        return pA - pB;
                    });

                    return (
                        <div key={station.id} className="flex-none w-[280px] sm:w-[320px] flex flex-col p-3 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all gap-2 snap-start">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate pr-2">
                                    {station.name}
                                </span>
                                
                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                    {station.distance} {t('min')}
                                    {station.isWalk ? (
                                        <Footprints className="w-3 h-3" />
                                    ) : (
                                        <Car className="w-3 h-3" />
                                    )}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {sortedLines.map((line, idx) => (
                                    <div key={`${station.id}-${line.id}-${idx}`} className="flex items-center gap-2 min-w-0">
                                        <TransportLineIcon line={line} />
                                        {line.destination && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                                <ArrowRight className="w-3 h-3 shrink-0 opacity-50" />
                                                <span className="truncate">{line.destination}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </HorizontalScrollWithFade>
    );
}

function TransportLineIcon({ line }: { line: TransportLine }) {
    // If bus and no color, use white/border
    const isBus = line.type === 'bus';
    const hasColor = !!line.color;
    
    // Metro/Train usually colored box
    // Bus usually white box with border if no color
    
    return (
        <div 
            className={cn(
                "flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-bold leading-none shrink-0 rounded-md shadow-sm",
                isBus && !hasColor ? "bg-background border border-border text-foreground" : "text-white"
            )}
            style={!isBus || hasColor ? { 
                backgroundColor: line.color,
                color: line.textColor || '#fff'
            } : undefined}
            title={`${line.type} ${line.name}`}
        >
            {line.name}
        </div>
    );
}

// Mock Data for Barcelona
export const mockBarcelonaStations: TransportStation[] = [
    {
        id: '1',
        name: 'Passeig de Gràcia',
        lines: [
            { id: 'l2', type: 'metro', name: 'L2', color: '#9F55A8', destination: 'Badalona Pompeu Fabra' },
            { id: 'l3', type: 'metro', name: 'L3', color: '#27A638', destination: 'Trinitat Nova' },
            { id: 'l4', type: 'metro', name: 'L4', color: '#FAB800', destination: 'La Pau' },
            { id: 'r2', type: 'train', name: 'R2', color: '#E1251B', destination: 'Maçanet-Massanes' }
        ],
        distance: 5,
        isWalk: true
    },
    {
        id: '2',
        name: 'Girona',
        lines: [
             { id: 'l4-g', type: 'metro', name: 'L4', color: '#FAB800', destination: 'Trinitat Nova' },
        ],
        distance: 8,
        isWalk: true
    },
    {
        id: '3',
        name: 'Diagonal',
        lines: [
             { id: 'l3-d', type: 'metro', name: 'L3', color: '#27A638', destination: 'Zona Universitària' },
             { id: 'l5', type: 'metro', name: 'L5', color: '#0055A4', destination: 'Cornellà Centre' }
        ],
        distance: 12,
        isWalk: false
    }
];
