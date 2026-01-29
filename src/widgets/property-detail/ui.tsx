'use client';

import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property/model/types';

// Entity components
import {
    PropertyGallery,
    PropertyHeader,
    PropertyPriceCard,
    PropertyMainInfo,
    PropertyDescriptionSection, // Using the existing collapsible one
    PropertyCharacteristics,
    PropertyAmenitiesGrid,
    PropertyLocationSection,
    PropertyStatsRow,
    PropertyPriceSection,
    PropertyAgentCard,
    PropertyMediaSection,
    PropertyTenantInfo
} from '@/entities/property/ui';

// Feature components
import { PropertyContactBar } from '@/features/property-contact';
import { PropertyActions } from '@/features/property-actions';

interface PropertyDetailWidgetProps {
    property: Property;
    className?: string;
}

export function PropertyDetailWidget({
    property,
    className
}: PropertyDetailWidgetProps) {
    const handleCall = () => {
        if (property.author?.phone) {
            window.location.href = `tel:${property.author.phone}`;
        }
    };

    const handleMessage = () => {
        console.log('Open message');
    };

    const handleToggleFavorite = (id: string) => {
        console.log('Toggle favorite:', id);
    };

    const handleShare = (id: string) => {
        console.log('Share:', id);
    };

    // Calculate rating (mock based on ID for consistency)
    const mockRating = 4.5 + (property.id.length % 5) / 10;

    return (
        <div className={cn('min-h-screen pb-24 lg:pb-12', className)}>
            {/* Mobile: Gallery matches full width, top of page */}
            <div className="lg:hidden mb-4">
                <PropertyGallery 
                    images={property.images} 
                    title={property.title}
                />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                {/* Desktop Layout: Grid with Sidebar */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 relative items-start">
                    
                    {/* Main Content Column (Left) */}
                    <div className="lg:col-span-8 space-y-8 w-full">
                        
                        {/* Header Section */}
                        <div className="space-y-6">
                             {/* Mobile Price/Actions row (below gallery) */}
                            <div className="lg:hidden flex items-start justify-between gap-4">
                                <PropertyPriceSection
                                    price={property.price}
                                    rentalConditions={property.rentalConditions}
                                    noCommission={property.noCommission}
                                    className="flex-1"
                                />
                                <PropertyActions
                                    propertyId={property.id}
                                    onToggleFavorite={handleToggleFavorite}
                                    onShare={handleShare}
                                />
                            </div>

                            <PropertyHeader 
                                title={property.title}
                                address={property.address}
                                isVerified={property.isVerified}
                                isNew={property.isNew}
                                rating={mockRating}
                                stats={{
                                    updatedAt: property.updatedAt || new Date(),
                                    viewsCount: property.viewsCount,
                                    viewsToday: property.viewsToday
                                }}
                            />

                            {/* Desktop Actions Bar - REMOVED, moving to split layout */}
                            {/* <div className="hidden lg:block">
                                <PropertyActions
                                    propertyId={property.id}
                                    onToggleFavorite={handleToggleFavorite}
                                    onShare={handleShare}
                                    variant="full" 
                                />
                             </div> */}

                            {/* Desktop Media Section */}
                            <div className="hidden lg:block">
                                <PropertyMediaSection 
                                    property={property}
                                    className="w-full"
                                    actions={
                                        <PropertyActions
                                            propertyId={property.id}
                                            variant="secondary"
                                            className="gap-1"
                                        />
                                    }
                                />
                            </div>
                        </div>

                        {/* Main Info (Stats) */}
                        <section>
                            <PropertyMainInfo
                                property={property}
                            />
                        </section>

                        {/* Description */}
                        <section className="border-t border-border/50 pt-6">
                            <PropertyDescriptionSection
                                description={property.description}
                                descriptionOriginal={property.descriptionOriginal}
                                maxLines={5}
                            />
                        </section>

                         {/* Characteristics */}
                        <section className="border-t border-border/50 pt-6">
                            <PropertyCharacteristics property={property} />
                        </section>

                        {/* Amenities - Moved above Location */}
                        {property.amenities && property.amenities.length > 0 && (
                            <section className="border-t border-border/50 pt-6">
                                <PropertyAmenitiesGrid
                                    amenities={property.amenities}
                                />
                            </section>
                        )}

                        {/* Tenant Info - New Component */}
                        <section className="border-t border-border/50 pt-6">
                             <PropertyTenantInfo property={property} />
                        </section>

                        {/* Location */}
                         <section className="border-t border-border/50 pt-6">
                            <PropertyLocationSection
                                address={property.address}
                                coordinates={property.coordinates}
                            />
                        </section>

                        {/* Mobile Agent Card */}
                        {property.author && (
                            <section className="lg:hidden border-t border-border/50 pt-6">
                                <PropertyAgentCard
                                    agent={property.author}
                                    onCall={handleCall}
                                    onMessage={handleMessage}
                                />
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column (Right) - Sticky */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-24 h-fit space-y-4">
                        <PropertyPriceCard
                            price={property.price}
                            rentalConditions={property.rentalConditions}
                            noCommission={property.noCommission}
                            author={property.author}
                            onCall={handleCall}
                            onMessage={handleMessage}
                            onToggleFavorite={() => handleToggleFavorite(property.id)}
                            onShare={() => handleShare(property.id)}
                            isFavorite={false} // Would need real state
                            actionButtons={
                                <PropertyActions
                                    propertyId={property.id}
                                    onToggleFavorite={handleToggleFavorite}
                                    onShare={handleShare}
                                    isFavorite={false} 
                                    variant="primary"
                                />
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <PropertyContactBar
                variant="sticky"
                phone={property.author?.phone}
                onCall={handleCall}
                onMessage={handleMessage}
                className="lg:hidden"
            />
        </div>
    );
}
