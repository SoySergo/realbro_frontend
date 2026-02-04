'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property/model/types';
import type { PropertyPageTranslations } from '@/shared/lib/get-property-translations';
import type { NearbyPlaces, AgentPropertyCard, SimilarPropertyCard } from '@/shared/api';

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
import { PropertyContactBar, ContactModal, useContactStore } from '@/features/property-contact';
import { PropertyActionsMenu } from '@/features/property-actions';
import { PropertyCompareButton } from '@/features/comparison';
import { PropertyNoteField } from '@/features/property-note';
import type { AuthorType } from '@/shared/api/contacts';

/**
 * Convert AgentPropertyCard/SimilarPropertyCard to Property format
 * for use with PropertyListSection
 */
function convertToProperty(card: AgentPropertyCard | SimilarPropertyCard): Property {
    return {
        id: card.id,
        title: card.title,
        type: card.type,
        price: card.price,
        rooms: card.rooms,
        bathrooms: card.bathrooms,
        area: card.area,
        floor: card.floor,
        totalFloors: card.totalFloors,
        address: card.address,
        city: card.city,
        district: card.district,
        coordinates: card.coordinates,
        images: card.images,
        description: '',
        features: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isNew: card.isNew,
        isVerified: card.isVerified
    };
}

interface PropertyDetailWidgetProps {
    property: Property;
    className?: string;
    translations: PropertyPageTranslations;
    locale: string;
    nearbyPlaces?: NearbyPlaces;
    agentProperties?: AgentPropertyCard[];
    similarProperties?: SimilarPropertyCard[];
}


export function PropertyDetailWidget({
    property,
    className,
    translations,
    locale,
    nearbyPlaces,
    agentProperties,
    similarProperties
}: PropertyDetailWidgetProps) {
    const t = translations;
    const tContact = useTranslations('contact');
    const tActions = useTranslations('actions');
    
    // Contact store
    const { openContactModal } = useContactStore();

    // Открыть модалку контактов
    const handleOpenContacts = useCallback(() => {
        if (!property.author) return;
        
        openContactModal({
            propertyId: property.id,
            authorId: property.author.id,
            authorType: property.author.type as AuthorType,
            authorName: property.author.name,
            authorAvatar: property.author.avatar,
        });
    }, [property, openContactModal]);

    const handleCall = useCallback(() => {
        handleOpenContacts();
    }, [handleOpenContacts]);

    const handleMessage = useCallback(() => {
        // TODO: Implement message functionality - открыть чат
    }, []);

    // Обработчики действий
    const handleLike = useCallback((propertyId: string, isLiked: boolean) => {
        console.log('[Property] Like toggled', { propertyId, isLiked });
    }, []);

    const handleDislike = useCallback((propertyId: string, isDisliked: boolean) => {
        console.log('[Property] Dislike toggled', { propertyId, isDisliked });
    }, []);

    const handleShare = useCallback((propertyId: string) => {
        console.log('[Property] Shared', { propertyId });
    }, []);

    const handleReport = useCallback((propertyId: string) => {
        console.log('[Property] Reported', { propertyId });
        // TODO: Открыть модалку жалобы
    }, []);

    // Calculate rating (mock based on ID for consistency)
    const mockRating = 4.5 + (property.id.length % 5) / 10;
    
    // Переводы для модалки контактов
    const contactModalTranslations = {
        title: tContact('title'),
        loadingTitle: tContact('loadingTitle'),
        authRequiredTitle: tContact('authRequiredTitle'),
        authRequiredDescription: tContact('authRequiredDescription'),
        authRequiredOwnerDescription: tContact('authRequiredOwnerDescription'),
        limitExceededTitle: tContact('limitExceededTitle'),
        limitExceededDescription: tContact('limitExceededDescription'),
        loginButton: tContact('loginButton'),
        upgradeButton: tContact('upgradeButton'),
        closeButton: tContact('closeButton'),
        phone: tContact('phone'),
        showPhone: tContact('showPhone'),
        call: tContact('call'),
        whatsapp: tContact('whatsapp'),
        telegram: tContact('telegram'),
        email: tContact('email'),
        website: tContact('website'),
        agencyProfile: tContact('agencyProfile'),
        copySuccess: tContact('copySuccess'),
        owner: tContact('owner'),
        agent: tContact('agent'),
        agency: tContact('agency'),
        limitInfo: tContact('limitInfo'),
    };
    
    // Переводы для действий
    const actionsMenuTranslations = {
        like: tActions('like'),
        liked: tActions('liked'),
        dislike: tActions('dislike'),
        disliked: tActions('disliked'),
        share: tActions('share'),
        copyLink: tActions('copyLink'),
        linkCopied: tActions('linkCopied'),
        addNote: tActions('addNote'),
        editNote: tActions('editNote'),
        noteSaved: tActions('noteSaved'),
        downloadPdf: tActions('downloadPdf'),
        report: tActions('report'),
        more: tActions('more'),
        noteModal: {
            title: tActions('noteModal.title'),
            description: tActions('noteModal.description'),
            placeholder: tActions('noteModal.placeholder'),
            saveButton: tActions('noteModal.saveButton'),
            cancelButton: tActions('noteModal.cancelButton'),
            closeButton: tActions('noteModal.closeButton'),
            characterCount: tActions('noteModal.characterCount'),
        },
    };

    // Prepare translations for SEO-critical components
    const characteristicsTranslations = {
        aboutFlat: t.characteristics.aboutFlat,
        aboutBuilding: t.characteristics.aboutBuilding,
        sqm: t.mainInfo.sqm,
        propertyType: t.characteristics.propertyType,
        totalArea: t.characteristics.totalArea,
        livingArea: t.characteristics.livingArea,
        kitchenArea: t.characteristics.kitchenArea,
        rooms: t.characteristics.rooms,
        floor: t.characteristics.floor,
        of: t.characteristics.of,
        ceilingHeight: t.characteristics.ceilingHeight,
        bathroom: t.characteristics.bathroom,
        balcony: t.characteristics.balcony,
        loggia: t.characteristics.balcony, // Use balcony translation for loggia
        renovation: t.characteristics.renovation,
        windowView: t.characteristics.windowView,
        residentialComplex: t.characteristics.title,
        buildingType: t.characteristics.buildingType,
        buildingYear: t.characteristics.buildingYear,
        floorsTotal: t.characteristics.floorsTotal,
        elevator: t.characteristics.elevator,
        parking: t.characteristics.parking,
        closedTerritory: t.characteristics.title,
        concierge: t.characteristics.title,
        garbageChute: t.characteristics.title,
        yes: t.characteristics.yes,
        no: t.characteristics.no,
        meters: 'm',
        types: t.characteristics.types,
        bathroomTypes: t.characteristics.bathroomTypes,
        renovationTypes: t.characteristics.renovationTypes,
        windowViews: t.characteristics.windowViews,
        buildingTypes: t.characteristics.buildingTypes,
        parkingTypes: t.characteristics.parkingTypes,
    };

    const mainInfoTranslations = {
        sqm: t.mainInfo.sqm,
        floor: t.mainInfo.floor,
        rooms: t.mainInfo.rooms,
        livingArea: t.mainInfo.livingArea,
        kitchenArea: t.mainInfo.kitchenArea,
        area: t.mainInfo.area,
        term: t.conditions.term,
        deposit: t.conditions.deposit,
        bathrooms: t.mainInfo.bathrooms,
        elevator: t.characteristics.elevator,
        yes: t.characteristics.yes,
        no: t.characteristics.no,
        minRentalPeriod: t.conditions.minRentalPeriod,
        months: t.conditions.months,
        of: t.characteristics.of,
    };

    const descriptionTranslations = {
        title: t.description.title,
        showMore: t.description.showMore,
        showLess: t.description.showLess,
        showOriginal: t.description.showOriginal,
        showTranslation: t.description.showTranslation,
        translatedByAI: t.description.translatedByAI,
    };

    const amenitiesTranslations = {
        title: t.amenities.title,
        showMore: t.common.showMore,
        showLess: t.common.showLess,
        showAllAmenities: t.amenities.showAllAmenities,
        items: t.amenities.items,
    };

    const tenantInfoTranslations = {
        tenantPreferences: t.tenant.tenantPreferences,
        roommates: t.tenant.roommates,
        age: t.tenant.age,
        gender: t.tenant.gender,
        occupation: t.tenant.occupation,
        minRentalPeriod: t.tenant.minRentalPeriod,
        smokingAllowed: t.tenant.smokingAllowed,
        couplesAllowed: t.tenant.couplesAllowed,
        petsAllowed: t.tenant.petsAllowed,
        childrenAllowed: t.tenant.childrenAllowed,
        ownerLivesIn: t.tenant.atmosphere,
        atmosphere: t.tenant.atmosphere,
        yes: t.characteristics.yes,
        no: t.characteristics.no,
        months: t.conditions.months,
        male: t.tenant.gender,
        female: t.tenant.gender,
        any: t.tenant.gender,
        student: t.tenant.occupation,
        working: t.tenant.occupation,
        quiet: t.tenant.atmosphere,
        social: t.tenant.atmosphere,
        mixed: t.tenant.atmosphere,
    };

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
                                <PropertyMobileMainInfo
                                    property={property}
                                    translations={{
                                        sqm: t.mainInfo.sqm,
                                        rooms: t.mainInfo.rooms,
                                        livingArea: t.mainInfo.livingArea,
                                        kitchenArea: t.mainInfo.kitchenArea,
                                        floor: t.mainInfo.floor,
                                        of: t.characteristics.of,
                                        term: t.conditions.term,
                                        deposit: t.conditions.deposit,
                                        bathrooms: t.mainInfo.bathrooms,
                                        elevator: t.characteristics.elevator,
                                        yes: t.characteristics.yes,
                                        no: t.characteristics.no,
                                        area: t.mainInfo.area,
                                        minRentalPeriod: t.conditions.minRentalPeriod,
                                        perMonth: t.conditions.perMonth,
                                        offerYourPrice: t.conditions.offerYourPrice,
                                        example: t.conditions.example,
                                    }}
                                    locale={locale}
                                />

                                <PropertyDescriptionSection
                                    description={property.description}
                                    descriptionOriginal={property.descriptionOriginal}
                                    variant="mobile"
                                    translations={descriptionTranslations}
                                />

                                {/* Mobile: Поле заметки перед характеристиками */}
                                <PropertyNoteField
                                    propertyId={property.id}
                                    variant="inline"
                                    className="mt-4"
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
                                translations={{
                                    updated: t.header.updated,
                                    views: t.header.views,
                                    viewsToday: t.header.viewsToday,
                                }}
                            />

                            {/* Desktop Media Section */}
                            <div id="photos" className="hidden lg:block scroll-mt-24">
                                <PropertyMediaSection
                                    property={property}
                                    className="w-full"
                                    actions={
                                        <>
                                            <PropertyActionsMenu
                                                propertyId={property.id}
                                                propertyTitle={property.title}
                                                variant="inline"
                                                translations={actionsMenuTranslations}
                                                onLike={handleLike}
                                                onDislike={handleDislike}
                                                onShare={handleShare}
                                                onReport={handleReport}
                                            />
                                            <PropertyCompareButton property={property} variant="full" size="sm" />
                                        </>
                                    }
                                />
                            </div>
                        </div>

                        {/* Main Info (Stats) - Desktop Only - SEO Critical */}
                        <section className="hidden lg:block">
                            <PropertyMainInfo
                                property={property}
                                translations={mainInfoTranslations}
                                locale={locale}
                            />
                        </section>

                        {/* Description - Desktop Only - SEO Critical */}
                        <section id="description" className="hidden lg:block border-t border-border/50 pt-6 scroll-mt-24">
                            <PropertyDescriptionSection
                                description={property.description}
                                descriptionOriginal={property.descriptionOriginal}
                                maxLines={5}
                                translations={descriptionTranslations}
                            />
                        </section>

                        {/* Desktop: Поле заметки перед характеристиками */}
                        <section className="hidden lg:block border-t border-border/50 pt-6">
                            <PropertyNoteField
                                propertyId={property.id}
                                variant="inline"
                            />
                        </section>

                        {/* Characteristics - SEO Critical */}
                        <section id="characteristics" className="border-t border-border/50 pt-6 scroll-mt-24">
                            <PropertyCharacteristics
                                property={property}
                                translations={characteristicsTranslations}
                            />
                        </section>

                        {/* Amenities - SEO Critical */}
                        {property.amenities && property.amenities.length > 0 && (
                            <section className="border-t border-border/50 pt-6">
                                <PropertyAmenitiesGrid
                                    amenities={property.amenities}
                                    translations={amenitiesTranslations}
                                />
                            </section>
                        )}

                        {/* Tenant Info - SEO Critical */}
                        <section className="border-t border-border/50 pt-6">
                            <PropertyTenantInfo
                                property={property}
                                translations={tenantInfoTranslations}
                            />
                        </section>

                        {/* Location */}
                        <section id="map" className="border-t border-border/50 pt-6 scroll-mt-24">
                            <PropertyLocationSection
                                address={property.address}
                                coordinates={property.coordinates}
                                nearbyTransport={property.nearbyTransportList}
                                nearbyPlaces={nearbyPlaces}
                            />
                        </section>

                        {/* Agent Block */}
                        {property.author && (
                            <section className="border-t border-border/50 pt-6">
                                <PropertyAgentBlock
                                    agent={property.author}
                                    translations={{
                                        agency: t.agent.agency,
                                        realtor: t.agent.realtor,
                                        reviews: t.agent.reviews,
                                        showPhone: t.agent.showPhone,
                                        sendMessage: t.agent.sendMessage,
                                    }}
                                    onCall={handleCall}
                                    onMessage={handleMessage}
                                />
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column (Right) - Sticky */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-[60px] h-fit space-y-4">
                        <PropertySidebarConditions
                            price={property.price}
                            rentalConditions={property.rentalConditions}
                            noCommission={property.noCommission}
                            translations={{
                                perMonth: t.conditions.perMonth,
                                priceHistory: t.conditions.priceHistory,
                                trackPrice: t.conditions.trackPrice,
                                like: t.contact.like,
                                dislike: t.contact.dislike,
                                share: t.contact.share,
                                offerYourPrice: t.conditions.offerYourPrice,
                                example: t.conditions.example,
                                utilities: t.conditions.utilities,
                                utilitiesIncluded: t.conditions.utilitiesIncluded,
                                utilitiesNotIncluded: t.conditions.utilitiesNotIncluded,
                                deposit: t.conditions.deposit,
                                rentalTerm: t.conditions.rentalTerm,
                                minRentalPeriod: t.conditions.minRentalPeriod,
                                longTerm: t.conditions.longTerm,
                                showPhone: t.agent.showPhone,
                                writeMessage: t.agent.writeMessage,
                                writeOnline: t.agent.writeOnline,
                            }}
                            locale={locale}
                            onCall={handleCall}
                            onMessage={handleMessage}
                            onLike={() => handleLike(property.id, true)}
                            onDislike={() => handleDislike(property.id, true)}
                            onShare={() => handleShare(property.id)}
                            author={property.author}
                        />

                        {property.author && (
                            <PropertyAgentSidebarCard
                                agent={property.author}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Suggestions Sections */}
            <div className="bg-muted/30 mt-16">
                {/* Other Offers Section - from the same agent */}
                {agentProperties && agentProperties.length > 0 && (
                    <PropertyListSection
                        title={t.related.otherOffers}
                        subtitle={property.author ? `${t.related.from} ${property.author.name}` : undefined}
                        properties={agentProperties.map(convertToProperty)}
                        viewAllText={t.related.showAll}
                        onViewAll={() => { }}
                        className="pb-6 pt-12"
                    />
                )}

                {/* Similar Properties Section */}
                {similarProperties && similarProperties.length > 0 && (
                    <PropertyListSection
                        title={t.related.similarProperties}
                        properties={similarProperties.map(convertToProperty)}
                        viewAllText={t.related.showAll}
                        onViewAll={() => { }}
                        className="pt-6 pb-20"
                    />
                )}
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <PropertyContactBar
                variant="sticky"
                phone={property.author?.phone}
                translations={{
                    contact: t.contact.contact,
                    call: t.contact.call,
                    message: t.contact.message,
                    like: t.contact.like,
                    dislike: t.contact.dislike,
                    showMore: t.contact.showMore,
                }}
                onCall={handleCall}
                onMessage={handleMessage}
                className="lg:hidden"
                actionsSlot={
                    <PropertyActionsMenu
                        propertyId={property.id}
                        propertyTitle={property.title}
                        variant="compact"
                        translations={actionsMenuTranslations}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onShare={handleShare}
                        onReport={handleReport}
                    />
                }
            />
            
            {/* Contact Modal */}
            <ContactModal translations={contactModalTranslations} />
        </div>
    );
}
