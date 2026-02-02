import { getTranslations } from 'next-intl/server';

/**
 * Collects all translations needed for the property detail page on the server.
 * This ensures translations are rendered in HTML for SEO indexing.
 */
export async function getPropertyPageTranslations(locale: string) {
    const t = await getTranslations({ locale, namespace: 'propertyDetail' });
    const tCommon = await getTranslations({ locale, namespace: 'common' });
    const tCharacteristics = await getTranslations({ locale, namespace: 'characteristics' });
    const tAmenities = await getTranslations({ locale, namespace: 'amenities' });
    const tProperty = await getTranslations({ locale, namespace: 'property' });

    return {
        // Common labels
        common: {
            perMonth: tCommon('perMonth'),
            showMore: tCommon('showMore'),
            showLess: tCommon('showLess'),
            back: tCommon('back'),
            loading: tCommon('loading'),
            euro: tCommon('euro'),
            months: tCommon('months'),
        },

        // Header & Navigation
        header: {
            back: t('back'),
            navPhotos: t('navPhotos'),
            navDescription: t('navDescription'),
            navCharacteristics: t('navCharacteristics'),
            navMap: t('navMap'),
            updated: t('updated'),
            views: t('views'),
            viewsToday: t('viewsToday'),
        },

        // Gallery & Media
        gallery: {
            photos: t('navPhotos'),
            video: t('video'),
            tour3d: t('tour3d'),
            plan: t('plan'),
            showAllPhotos: t('showAllPhotos'),
        },

        // Main Info
        mainInfo: {
            sqm: t('sqm'),
            floor: t('floor'),
            rooms: t('rooms'),
            roomsShort: t('roomsShort'),
            livingArea: t('livingArea'),
            kitchenArea: t('kitchenArea'),
            ceilingHeight: t('ceilingHeight'),
            bathrooms: t('bathrooms'),
            area: t('area'),
            pricePerMeter: t('pricePerMeter'),
        },

        // Description
        description: {
            title: t('description'),
            showMore: t('showMore'),
            showLess: t('showLess'),
            showOriginal: t('showOriginal'),
            showTranslation: t('showTranslation'),
            translatedByAI: t('translatedByAI'),
        },

        // Characteristics
        characteristics: {
            title: t('characteristics'),
            aboutFlat: t('aboutFlat'),
            aboutBuilding: t('aboutBuilding'),
            propertyType: tCharacteristics('propertyType'),
            totalArea: tCharacteristics('totalArea'),
            livingArea: tCharacteristics('livingArea'),
            kitchenArea: tCharacteristics('kitchenArea'),
            rooms: tCharacteristics('rooms'),
            floor: tCharacteristics('floor'),
            of: tCharacteristics('of'),
            ceilingHeight: tCharacteristics('ceilingHeight'),
            bathroom: tCharacteristics('bathroom'),
            balcony: tCharacteristics('balcony'),
            renovation: tCharacteristics('renovation'),
            windowView: tCharacteristics('windowView'),
            buildingType: tCharacteristics('buildingType'),
            buildingYear: tCharacteristics('buildingYear'),
            floorsTotal: tCharacteristics('floorsTotal'),
            elevator: tCharacteristics('elevator'),
            parking: tCharacteristics('parking'),
            yes: tCharacteristics('yes'),
            no: tCharacteristics('no'),
            // Types
            types: {
                apartment: tCharacteristics('types.apartment'),
                studio: tCharacteristics('types.studio'),
                penthouse: tCharacteristics('types.penthouse'),
                duplex: tCharacteristics('types.duplex'),
            },
            bathroomTypes: {
                combined: tCharacteristics('bathroomTypes.combined'),
                separate: tCharacteristics('bathroomTypes.separate'),
                multiple: tCharacteristics('bathroomTypes.multiple'),
            },
            renovationTypes: {
                cosmetic: tCharacteristics('renovationTypes.cosmetic'),
                euro: tCharacteristics('renovationTypes.euro'),
                designer: tCharacteristics('renovationTypes.designer'),
                'requires-repair': tCharacteristics('renovationTypes.requires-repair'),
                none: tCharacteristics('renovationTypes.none'),
            },
            windowViews: {
                street: tCharacteristics('windowViews.street'),
                yard: tCharacteristics('windowViews.yard'),
                both: tCharacteristics('windowViews.both'),
            },
            buildingTypes: {
                brick: tCharacteristics('buildingTypes.brick'),
                monolith: tCharacteristics('buildingTypes.monolith'),
                panel: tCharacteristics('buildingTypes.panel'),
                block: tCharacteristics('buildingTypes.block'),
            },
            parkingTypes: {
                underground: tCharacteristics('parkingTypes.underground'),
                ground: tCharacteristics('parkingTypes.ground'),
                street: tCharacteristics('parkingTypes.street'),
                none: tCharacteristics('parkingTypes.none'),
            },
        },

        // Amenities
        amenities: {
            title: t('amenities'),
            showAllAmenities: t('showAllAmenities'),
            // Individual amenities
            items: {
                wifi: tAmenities('wifi'),
                internet: tAmenities('internet'),
                tv: tAmenities('tv'),
                airConditioning: tAmenities('airConditioning'),
                refrigerator: tAmenities('refrigerator'),
                washingMachine: tAmenities('washingMachine'),
                dishwasher: tAmenities('dishwasher'),
                microwave: tAmenities('microwave'),
                coffeeMachine: tAmenities('coffeeMachine'),
                kitchen: tAmenities('kitchen'),
                furniture: tAmenities('furniture'),
                bathtub: tAmenities('bathtub'),
                shower: tAmenities('shower'),
                heating: tAmenities('heating'),
                intercom: tAmenities('intercom'),
                parking: tAmenities('parking'),
                balcony: tAmenities('balcony'),
                terrace: tAmenities('terrace'),
                elevator: tAmenities('elevator'),
                pool: tAmenities('pool'),
                gym: tAmenities('gym'),
            },
        },

        // Location section
        location: {
            title: t('location'),
            infrastructure: t('infrastructure'),
            showOnMap: t('showOnMap'),
            walkMinutes: t('walkMinutes'),
            categories: {
                transport: t('locationSection.categories.transport'),
                schools: t('locationSection.categories.schools'),
                medical: t('locationSection.categories.medical'),
                groceries: t('locationSection.categories.groceries'),
                shopping: t('locationSection.categories.shopping'),
                restaurants: t('locationSection.categories.restaurants'),
                sports: t('locationSection.categories.sports'),
                parks: t('locationSection.categories.parks'),
                beauty: t('locationSection.categories.beauty'),
                entertainment: t('locationSection.categories.entertainment'),
                attractions: t('locationSection.categories.attractions'),
            },
        },

        // Tenant info & Living rules
        tenant: {
            tenantPreferences: t('tenantPreferences'),
            livingRules: t('livingRules'),
            roommates: t('roommates'),
            aboutRoommates: t('aboutRoommates'),
            petsAllowed: t('petsAllowed'),
            childrenAllowed: t('childrenAllowed'),
            couplesAllowed: t('couplesAllowed'),
            smokingAllowed: t('smokingAllowed'),
            studentsAllowed: t('studentsAllowed'),
            gender: t('gender'),
            age: t('age'),
            atmosphere: t('atmosphere'),
            occupation: t('occupation'),
            minRentalPeriod: tCharacteristics('minRentalPeriod'),
            noSpecialConditions: t('noSpecialConditions'),
        },

        // Rental conditions (sidebar)
        conditions: {
            deposit: t('deposit'),
            commission: t('commission'),
            noCommission: t('noCommission'),
            prepayment: t('prepayment'),
            utilitiesIncluded: t('utilitiesIncluded'),
            utilitiesNotIncluded: t('utilitiesNotIncluded'),
            utilities: t('utilities'),
            utilitiesIncludedFull: t('utilitiesIncludedFull'),
            utilitiesNotIncludedShort: t('utilitiesNotIncludedShort'),
            totalAtStart: t('totalAtStart'),
            perMonth: t('perMonth'),
            minRentalPeriod: t.raw('minRentalPeriod') as string,
            term: t('term'),
            rentalTerm: t('rentalTerm'),
            longTerm: t('longTerm'),
            months: t('months'),
            fromYear: t('fromYear'),
            priceHistory: t('priceHistory'),
            trackPrice: t('trackPrice'),
            offerYourPrice: t('offerYourPrice'),
            example: t('example'),
        },

        // Agent info
        agent: {
            agent: t('agent'),
            agency: t('agency'),
            realtor: t('realtor'),
            privateAgent: t('privateAgent'),
            superAgent: t('superAgent'),
            verified: t('verified'),
            docsVerified: t('docsVerified'),
            yearsOnPlatform: t('yearsOnPlatform'),
            onPlatform: t('onPlatform'),
            years_short: t('years_short'),
            objectsCount: t('objectsCount'),
            objectsInWork: t('objectsInWork'),
            reviews: t('reviews'),
            call: t('call'),
            message: t('message'),
            showPhone: t('showPhone'),
            writeMessage: t('writeMessage'),
            writeOnline: t('writeOnline'),
            sendMessage: t('sendMessage'),
        },

        // Contact & Actions
        contact: {
            call: t('call'),
            message: t('message'),
            addToFavorites: t('addToFavorites'),
            inFavorites: t('inFavorites'),
            share: t('share'),
            like: t('like'),
            dislike: t('dislike'),
            contact: t('contact'),
            showMore: tCommon('showMore'),
            note: t('note'),
            pdf: t('pdf'),
            report: t('report'),
        },

        // Related properties
        related: {
            otherOffers: t('otherOffers'),
            similarProperties: t('similarProperties'),
            showAll: t('showAll'),
            from: t('from'),
        },

        // Property labels
        property: {
            verified: tProperty('verified'),
            top: tProperty('top'),
            new: tProperty('new'),
            agent: tProperty('agent'),
            owner: tProperty('owner'),
            agency: tProperty('agency'),
        },
    };
}

export type PropertyPageTranslations = Awaited<ReturnType<typeof getPropertyPageTranslations>>;
