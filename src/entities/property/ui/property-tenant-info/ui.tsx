

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Check, X, User, Users, Briefcase, Moon, Sun, Coffee, PersonStandingIcon } from 'lucide-react';
import type { Property } from '@/entities/property/model/types';

interface PropertyTenantInfoProps {
    property: Property;
    className?: string;
}

export function PropertyTenantInfo({
    property,
    className
}: PropertyTenantInfoProps) {
    const t = useTranslations('propertyDetail');
    const tChars = useTranslations('characteristics');

    // Tenant preferences (Están buscando...)
    const tenantPrefData = property.tenantPreferences ? [
        {
            key: 'age',
            icon: <User className="w-4 h-4 text-muted-foreground" />,
            label: tChars('age'),
            value: property.tenantPreferences.ageRange 
                ? `${property.tenantPreferences.ageRange[0]} - ${property.tenantPreferences.ageRange[1]}`
                : null,
            show: !!property.tenantPreferences.ageRange
        },
        {
            key: 'gender',
            icon: <PersonStandingIcon className="w-[18px] h-[18px] text-muted-foreground" />,
            label: tChars('gender'),
            value: property.tenantPreferences.gender ? tChars(property.tenantPreferences.gender) : null,
            show: !!property.tenantPreferences.gender
        },
        {
            key: 'occupation',
            icon: <Briefcase className="w-4 h-4 text-muted-foreground" />,
            label: tChars('occupation'),
            value: property.tenantPreferences.occupation ? tChars(property.tenantPreferences.occupation) : null,
            show: !!property.tenantPreferences.occupation
        },
        {
            key: 'minRentalPeriod',
            icon: <Moon className="w-4 h-4 text-muted-foreground" />,
            label: tChars('minRentalPeriod'),
            value: property.tenantPreferences.minRentalMonths 
                ? `${property.tenantPreferences.minRentalMonths} ${t('months')}` 
                : null,
            show: !!property.tenantPreferences.minRentalMonths
        },
        {
            key: 'smokingAllowed',
            icon: property.tenantPreferences.smokingAllowed ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
            label: tChars('smokingAllowed'),
            value: property.tenantPreferences.smokingAllowed ? tChars('yes') : tChars('no'),
            show: property.tenantPreferences.smokingAllowed !== undefined
        },
        {
            key: 'couplesAllowed',
            icon: property.tenantPreferences.couplesAllowed ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
            label: tChars('couplesAllowed'),
            value: property.tenantPreferences.couplesAllowed ? tChars('yes') : tChars('no'),
            show: property.tenantPreferences.couplesAllowed !== undefined
        },
        {
            key: 'petsAllowed',
            icon: property.tenantPreferences.petsAllowed ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
            label: tChars('petsAllowed'),
            value: property.tenantPreferences.petsAllowed ? tChars('yes') : tChars('no'),
            show: property.tenantPreferences.petsAllowed !== undefined
        },
        {
            key: 'childrenAllowed',
            icon: property.tenantPreferences.childrenAllowed ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
            label: tChars('childrenAllowed'),
            value: property.tenantPreferences.childrenAllowed ? tChars('yes') : tChars('no'),
            show: property.tenantPreferences.childrenAllowed !== undefined
        }
    ].filter(c => c.show && c.value) : [];

    // Roommates (Tus compañeros/as)
    const roommatesData = property.roommates ? [
        {
            key: 'age',
            icon: <User className="w-4 h-4 text-muted-foreground" />,
            label: tChars('age'),
            value: property.roommates.ageRange 
            ? `${property.roommates.ageRange[0]} - ${property.roommates.ageRange[1]}`
            : null,
            show: !!property.roommates.ageRange
        },
        {
            key: 'gender',
            icon: <PersonStandingIcon className="w-[18px] h-[18px] text-muted-foreground" />,
            label: tChars('gender'),
            value: property.roommates.gender ? tChars(property.roommates.gender) : null,
            show: !!property.roommates.gender
        },
        {
            key: 'occupation',
            icon: <Briefcase className="w-4 h-4 text-muted-foreground" />,
            label: tChars('occupation'),
            value: property.roommates.occupation ? tChars(property.roommates.occupation) : null,
            show: !!property.roommates.occupation
        },
        {
            key: 'ownerLivesIn',
            icon: <Sun className="w-4 h-4 text-muted-foreground" />,
            label: tChars('ownerLivesIn'),
            value: property.roommates.ownerLivesIn !== undefined 
                ? property.roommates.ownerLivesIn ? tChars('yes') : tChars('no')
                : null,
            show: property.roommates.ownerLivesIn !== undefined
        },
         {
            key: 'atmosphere',
            icon: <Coffee className="w-4 h-4 text-muted-foreground" />,
            label: tChars('atmosphere'),
            value: property.roommates.atmosphere ? tChars(property.roommates.atmosphere) : null,
            show: !!property.roommates.atmosphere
        }
    ].filter(c => c.show && c.value) : [];

    const StatusList = ({
        title,
        items
    }: {
        title: string;
        items: { key: string; icon: React.ReactNode; label: string; value: string | null | undefined }[]
    }) => {
        if (!items.length) return null;

        return (
             <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                <div className="grid grid-cols-[auto_160px_1fr] gap-x-4 gap-y-3 items-center text-sm">
                    {items.map(item => (
                        <div key={item.key} className="contents">
                            <div className="flex items-center justify-center w-5 h-5 text-muted-foreground shrink-0">
                                {item.icon}
                            </div>
                            <span className="text-muted-foreground">{item.label}</span>
                             <span className="font-medium text-foreground">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
             </div>
        )
    }

    if (!tenantPrefData.length && !roommatesData.length) return null;

    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-secondary rounded-2xl p-6', className)}>
            {tenantPrefData.length > 0 && (
                    <StatusList
                    title={tChars('tenantPreferences')}
                    items={tenantPrefData}
                    />
            )}
            
            {roommatesData.length > 0 && (
                <StatusList 
                    title={tChars('roommates')}
                    items={roommatesData}
                />
            )}
        </div>
    );
}
