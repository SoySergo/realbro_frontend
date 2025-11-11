import type { Metadata } from 'next';

export const siteConfig = {
    name: 'RealEstate Barcelona',
    description: 'Поиск жилой недвижимости в аренду в провинции Барселона',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const defaultMetadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        'аренда',
        'недвижимость',
        'Барселона',
        'квартира',
        'жилье',
        'property',
        'rent',
        'Barcelona',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
    },
};
