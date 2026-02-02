import { cn } from '@/shared/lib/utils';
import { Check, X, User, Briefcase, Moon, Sun, Coffee, PersonStandingIcon } from 'lucide-react';
import type { Property } from '@/entities/property/model/types';

// SEO-critical component - NO 'use client' to ensure translations are in HTML

interface TenantInfoTranslations {
    tenantPreferences: string;
    roommates: string;
    age: string;
    gender: string;
    occupation: string;
    minRentalPeriod: string;
    smokingAllowed: string;
    couplesAllowed: string;
    petsAllowed: string;
    childrenAllowed: string;
    ownerLivesIn: string;
    atmosphere: string;
    yes: string;
    no: string;
    months: string;
    // Gender values
    male: string;
    female: string;
    any: string;
    // Occupation values
    student: string;
    working: string;
    // Atmosphere values
    quiet: string;
    social: string;
    mixed: string;
}

interface PropertyTenantInfoProps {
    property: Property;
    className?: string;
    translations: TenantInfoTranslations;
}

export function PropertyTenantInfo({
    property,
    className,
    translations: t
}: PropertyTenantInfoProps) {
    // Helper to get translated value
    const getGenderValue = (gender?: string) => {
        if (!gender) return null;
        switch (gender) {
            case 'male': return t.male;
            case 'female': return t.female;
            case 'any': return t.any;
            default: return gender;
        }
    };

    const getOccupationValue = (occupation?: string) => {
        if (!occupation) return null;
        switch (occupation) {
            case 'student': return t.student;
            case 'working': return t.working;
            default: return occupation;
        }
    };

    const getAtmosphereValue = (atmosphere?: string) => {
        if (!atmosphere) return null;
        switch (atmosphere) {
            case 'quiet': return t.quiet;
            case 'social': return t.social;
            case 'mixed': return t.mixed;
            default: return atmosphere;
        }
    };

    // Tenant preferences
    const tenantPrefData = property.tenantPreferences ? [
        {
            key: 'age',
            icon: <User className="w-4 h-4 text-muted-foreground" />,
            label: t.age,
            value: property.tenantPreferences.ageRange
                ? `${property.tenantPreferences.ageRange[0]} - ${property.tenantPreferences.ageRange[1]}`
                : null,
            show: !!property.tenantPreferences.ageRange
        },
        {
            key: 'gender',
            icon: <PersonStandingIcon className="w-[18px] h-[18px] text-muted-foreground" />,
            label: t.gender,
            value: getGenderValue(property.tenantPreferences.gender),
            show: !!property.tenantPreferences.gender
        },
        {
            key: 'occupation',
            icon: <Briefcase className="w-4 h-4 text-muted-foreground" />,
            label: t.occupation,
            value: getOccupationValue(property.tenantPreferences.occupation),
            show: !!property.tenantPreferences.occupation
        },
        {
            key: 'minRentalPeriod',
            icon: <Moon className="w-4 h-4 text-muted-foreground" />,
            label: t.minRentalPeriod,
            value: property.tenantPreferences.minRentalMonths
                ? `${property.tenantPreferences.minRentalMonths} ${t.months}`
                : null,
            show: !!property.tenantPreferences.minRentalMonths
        },
        {
            key: 'smokingAllowed',
            icon: property.tenantPreferences.smokingAllowed ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />,
            label: t.smokingAllowed,
            value: property.tenantPreferences.smokingAllowed ? t.yes : t.no,
            show: property.tenantPreferences.smokingAllowed !== undefined
        },
        {
            key: 'couplesAllowed',
            icon: property.tenantPreferences.couplesAllowed ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />,
            label: t.couplesAllowed,
            value: property.tenantPreferences.couplesAllowed ? t.yes : t.no,
            show: property.tenantPreferences.couplesAllowed !== undefined
        },
        {
            key: 'petsAllowed',
            icon: property.tenantPreferences.petsAllowed ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />,
            label: t.petsAllowed,
            value: property.tenantPreferences.petsAllowed ? t.yes : t.no,
            show: property.tenantPreferences.petsAllowed !== undefined
        },
        {
            key: 'childrenAllowed',
            icon: property.tenantPreferences.childrenAllowed ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />,
            label: t.childrenAllowed,
            value: property.tenantPreferences.childrenAllowed ? t.yes : t.no,
            show: property.tenantPreferences.childrenAllowed !== undefined
        }
    ].filter(c => c.show && c.value) : [];

    // Roommates
    const roommatesData = property.roommates ? [
        {
            key: 'age',
            icon: <User className="w-4 h-4 text-muted-foreground" />,
            label: t.age,
            value: property.roommates.ageRange
                ? `${property.roommates.ageRange[0]} - ${property.roommates.ageRange[1]}`
                : null,
            show: !!property.roommates.ageRange
        },
        {
            key: 'gender',
            icon: <PersonStandingIcon className="w-[18px] h-[18px] text-muted-foreground" />,
            label: t.gender,
            value: getGenderValue(property.roommates.gender),
            show: !!property.roommates.gender
        },
        {
            key: 'occupation',
            icon: <Briefcase className="w-4 h-4 text-muted-foreground" />,
            label: t.occupation,
            value: getOccupationValue(property.roommates.occupation),
            show: !!property.roommates.occupation
        },
        {
            key: 'ownerLivesIn',
            icon: <Sun className="w-4 h-4 text-muted-foreground" />,
            label: t.ownerLivesIn,
            value: property.roommates.ownerLivesIn !== undefined
                ? property.roommates.ownerLivesIn ? t.yes : t.no
                : null,
            show: property.roommates.ownerLivesIn !== undefined
        },
        {
            key: 'atmosphere',
            icon: <Coffee className="w-4 h-4 text-muted-foreground" />,
            label: t.atmosphere,
            value: getAtmosphereValue(property.roommates.atmosphere),
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
        );
    };

    if (!tenantPrefData.length && !roommatesData.length) return null;

    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-secondary rounded-2xl p-6', className)}>
            {tenantPrefData.length > 0 && (
                <StatusList
                    title={t.tenantPreferences}
                    items={tenantPrefData}
                />
            )}

            {roommatesData.length > 0 && (
                <StatusList
                    title={t.roommates}
                    items={roommatesData}
                />
            )}
        </div>
    );
}
