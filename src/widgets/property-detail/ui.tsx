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
    PropertyTenantInfo,
    PropertySidebarConditions, // Re-adding
    PropertyAgentSidebarCard,
    PropertyAgentBlock,
    PropertyListSection
} from '@/entities/property/ui';

// Feature components
import { PropertyContactBar } from '@/features/property-contact';
import { PropertyActions } from '@/features/property-actions';

import { useTranslations } from 'next-intl';

interface PropertyDetailWidgetProps {
    property: Property;
    className?: string;
}

export function PropertyDetailWidget({
    property,
    className
}: PropertyDetailWidgetProps) {
    const t = useTranslations('propertyDetail');

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
        <div className={cn('min-h-screen pb-24 pt-8 lg:pb-0', className)}>
            {/* Mobile Top Info Strip */}
            <div className="lg:hidden px-4 mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    Сдается {property.rooms}-комн. {property.type === 'apartment' ? 'квартира' : 'объект'}, {property.area} м²
                </span>
                <button className="text-muted-foreground">
                    <span className="sr-only">Menu</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
            </div>

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

                             {/* Mobile Price (below title) */}
                            <div className="lg:hidden flex items-start justify-between gap-4">
                                <PropertyPriceSection
                                    price={property.price}
                                    rentalConditions={property.rentalConditions}
                                    noCommission={property.noCommission}
                                    className="flex-1"
                                />
                                {/* Actions moved to sticky header */}
                            </div>

                            
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

                        {/* Main Info (Stats) */}
                        <section>
                            <PropertyMainInfo
                                property={property}
                            />
                        </section>

                        {/* Description */}
                        <section id="description" className="border-t border-border/50 pt-6 scroll-mt-24">
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
                            onLike={() => console.log('Like', property.id)}
                            onDislike={() => console.log('Dislike', property.id)}
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
                    title={t("otherOffers")} // Add translation key later
                    subtitle={property.author ? `${t("from")} ${property.author.name}` : undefined}
                    properties={[property, property, property, property]} // Mock data: repeat current property
                    viewAllText={t("showAll")}
                    onViewAll={() => console.log('View all other offers')}
                    className="pb-6 pt-12"
                />

                {/* Similar Properties Section */}
                <PropertyListSection
                    title={t("similarProperties")} // Add translation key later
                    properties={[property, property, property, property]} // Mock data
                    viewAllText={t("showAll")}
                    onViewAll={() => console.log('View all similar')}
                    className="pt-6 pb-20"
                />
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
