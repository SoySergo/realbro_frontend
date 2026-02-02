'use client';

import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property/model/types';
import type { PropertyPageTranslations } from '@/shared/lib/get-property-translations';

// Entity components
import {
    PropertyGallery,
    PropertyHeader,
    PropertyMainInfo,
    PropertyDescriptionSection,
    PropertyCharacteristics,
    PropertyAmenitiesGrid,
    PropertyLocationSection,
    PropertyMediaSection,
    PropertyTenantInfo,
    PropertySidebarConditions,
    PropertyAgentSidebarCard,
    PropertyAgentBlock,
    PropertyListSection,
    PropertyMobileMainInfo
} from '@/entities/property/ui';

// Feature components
import { PropertyContactBar } from '@/features/property-contact';
import { PropertyActions } from '@/features/property-actions';

interface PropertyDetailWidgetProps {
    property: Property;
    className?: string;
    translations: PropertyPageTranslations;
    locale: string;
}


export function PropertyDetailWidget({
    property,
    className,
    translations,
    locale
}: PropertyDetailWidgetProps) {
    const t = translations;

    const handleCall = () => {
        if (property.author?.phone) {
            window.location.href = `tel:${property.author.phone}`;
        }
    };

    const handleMessage = () => {
        // TODO: Implement message functionality
    };

    const handleToggleFavorite = (_id: string) => {
        // TODO: Implement toggle favorite functionality
    };

    const handleShare = (_id: string) => {
        // TODO: Implement share functionality
    };

    const handleLike = () => {
        // TODO: Implement like functionality
    };

    const handleDislike = () => {
        // TODO: Implement dislike functionality
    };

    const handleMore = () => {
        // TODO: Implement more options functionality
    };

    // Calculate rating (mock based on ID for consistency)
    const mockRating = 4.5 + (property.id.length % 5) / 10;

    return (
        <div className={cn('min-h-screen pb-24 pt-[60px] lg:pt-8 lg:pb-0', className)}>

            {/* Mobile: Gallery matches full width, top of page */}
            <div className="lg:hidden mb-0">
                <PropertyGallery 
                    images={property.images} 
                    title={property.title}
                    floorPlan={property.floorPlan}
                    video={property.video}
                    tour3d={property.tour3d}
                />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                {/* Desktop Layout: Grid with Sidebar */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 relative items-start">
                    
                    {/* Main Content Column (Left) */}
                    <div className="lg:col-span-8 space-y-8 w-full">
                        
                        {/* Header Section */}
                        <div className="space-y-6">
                            
                            {/* Mobile: New Main Info Block + Address */}
                            <div className="lg:hidden space-y-6 mt-4">
                                <PropertyMobileMainInfo property={property} />
                                
                                <PropertyDescriptionSection
                                    description={property.description}
                                    descriptionOriginal={property.descriptionOriginal}
                                    variant="mobile"
                                />
                            </div>

                            <PropertyHeader 
                                className="hidden lg:block"
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

                             {/* Mobile Price (REMOVED - now in MobileMainInfo) */}
                            
                            {/* Desktop Media Section */}
                            <div id="photos" className="hidden lg:block scroll-mt-24">
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

                        {/* Main Info (Stats) - Desktop Only */}
                        <section className="hidden lg:block">
                            <PropertyMainInfo
                                property={property}
                            />
                        </section>

                        {/* Description - Desktop Only */}
                        <section id="description" className="hidden lg:block border-t border-border/50 pt-6 scroll-mt-24">
                            <PropertyDescriptionSection
                                description={property.description}
                                descriptionOriginal={property.descriptionOriginal}
                                maxLines={5}
                            />
                        </section>

                         {/* Characteristics */}
                        <section id="characteristics" className="border-t border-border/50 pt-6 scroll-mt-24">
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
                         <section id="map" className="border-t border-border/50 pt-6 scroll-mt-24">
                            <PropertyLocationSection
                                address={property.address}
                                coordinates={property.coordinates}
                                nearbyTransport={property.nearbyTransportList}
                            />
                        </section>

                        {/* Agent Block - Visible on all screens primarily (or you can restrict to mobile if prefered, but "below map" usually implies main flow) 
                            Actually, let's keep it visible everywhere as it provides more info than the sidebar card */}
                        {property.author && (
                            <section className="border-t border-border/50 pt-6">
                                <PropertyAgentBlock
                                    agent={property.author}
                                    onCall={handleCall}
                                    onMessage={handleMessage}
                                />
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column (Right) - Sticky - Adjusted to ~60px offset from viewport top */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-[60px] h-fit space-y-4">
                        <PropertySidebarConditions
                            price={property.price}
                            rentalConditions={property.rentalConditions}
                            noCommission={property.noCommission}
                            // author={property.author} // Author info moved to separate card
                            onCall={handleCall}
                            onMessage={handleMessage}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onShare={() => handleShare(property.id)}
                            author={property.author} // Passed for online status check
                        />
                        
                        {property.author && (
                            <PropertyAgentSidebarCard 
                                agent={property.author}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer for testing sticky sidebar behavior is handled by the new sections essentially pushing content down */}
            {/* Suggestions Sections */}
            <div className="bg-muted/30 mt-16">
                {/* Other Offers Section */}
                <PropertyListSection
                    title={t.related.otherOffers}
                    subtitle={property.author ? `${t.related.from} ${property.author.name}` : undefined}
                    properties={[property, property, property, property]}
                    viewAllText={t.related.showAll}
                    onViewAll={() => {}}
                    className="pb-6 pt-12"
                />

                {/* Similar Properties Section */}
                <PropertyListSection
                    title={t.related.similarProperties}
                    properties={[property, property, property, property]}
                    viewAllText={t.related.showAll}
                    onViewAll={() => {}}
                    className="pt-6 pb-20"
                />
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <PropertyContactBar
                variant="sticky"
                phone={property.author?.phone}
                onCall={handleCall}
                onMessage={handleMessage}
                onLike={handleLike}
                onDislike={handleDislike}
                onMore={handleMore}
                className="lg:hidden"
            />
        </div>
    );
}
