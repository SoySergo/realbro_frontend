import { type SVGProps } from 'react';

export const CloudSyncIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-cloud-sync ${props.className || ''}`}
        {...props}
    >
        <path d="m17 18-1.535 1.605a5 5 0 0 1-8-1.5" />
        <path d="M17 22v-4h-4" />
        <path d="M20.996 15.251A4.5 4.5 0 0 0 17.495 8h-1.79a7 7 0 1 0-12.709 5.607" />
        <path d="M7 10v4h4" />
        <path d="m7 14 1.535-1.605a5 5 0 0 1 8 1.5" />
    </svg>
);

export const CloudCheckIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-cloud-check ${props.className || ''}`}
        {...props}
    >
        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
        <path d="m9 17 2 2 4-4" />
    </svg>
);