'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { PropertyGallery } from './ui';
import type { Property } from '@/entities/property/model/types';
import Image from 'next/image';
import { Play, Box } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PropertyMediaSectionProps {
    property: Property;
    className?: string;
    actions?: React.ReactNode;
}

type MediaType = 'photos' | 'video' | 'tour3d' | 'plan';

export function PropertyMediaSection({ property, className, actions }: PropertyMediaSectionProps) {
    const t = useTranslations('propertyDetail');
    const [activeTab, setActiveTab] = useState<MediaType>('photos');

    const tabs = [
        { id: 'photos', label: t('navPhotos'), count: property.images.length, hasData: true },
        { id: 'video', label: t('video'), count: 0, hasData: !!property.video },
        { id: 'tour3d', label: t('tour3d'), count: 0, hasData: !!property.tour3d },
        { id: 'plan', label: t('plan'), count: 0, hasData: !!property.floorPlan },
    ] as const;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Tabs & Actions */}
            <div className="flex items-center justify-between border-b border-border/50 pb-0">
                <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isDisabled = tab.id !== 'photos' && !tab.hasData; 

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && setActiveTab(tab.id as MediaType)}
                                disabled={isDisabled}
                                className={cn(
                                    'relative pb-3 text-sm font-medium transition-colors whitespace-nowrap',
                                    isActive
                                        ? 'text-foreground border-b-2 border-foreground'
                                        : 'text-muted-foreground hover:text-foreground/80',
                                    isDisabled && 'opacity-50 cursor-not-allowed hover:text-muted-foreground'
                                )}
                            >
                                {tab.label}
                                {tab.count > 0 && <span className="ml-1 opacity-60">{tab.count}</span>}
                            </button>
                        );
                    })}
                </div>
                
                {actions && (
                    <div className="pb-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative mt-4">
                {activeTab === 'photos' && (
                    <PropertyGallery 
                        images={property.images} 
                        title={property.title}
                    />
                )}

                {activeTab === 'video' && property.video && (
                    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                         {/* In a real app, this would be a video player */}
                        <div className="text-center text-white z-10">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <Play className="w-8 h-8 fill-white" />
                             </div>
                             <p className="font-medium">{t('videoPresentation')}</p>
                        </div>
                         <Image 
                            src={property.video.thumbnail || property.images[0]} 
                            alt="Video thumbnail" 
                            fill 
                            className="object-cover opacity-50" 
                        />
                    </div>
                )}

                {activeTab === 'tour3d' && property.tour3d && (
                    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                        <div className="text-center text-white z-10">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <Box className="w-8 h-8" />
                             </div>
                             <p className="font-medium">{t('tour3d')}</p>
                        </div>
                        <Image 
                            src={property.tour3d.thumbnail || property.images[0]} 
                            alt="3D Tour thumbnail" 
                            fill 
                            className="object-cover opacity-30" 
                        />
                    </div>
                )}

                {activeTab === 'plan' && property.floorPlan && (
                    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-white flex items-center justify-center p-8 border border-border">
                        <div className="relative w-full h-full">
                            <Image
                                src={property.floorPlan}
                                alt="Floor plan"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
