import { SearchPageHeader } from './_header/ui';
import { SearchPageSidebar } from './_sidebar/ui';

type Props = {
    children: React.ReactNode;
};

export default function SlugLayout({ children }: Props) {
    return (
        <div className="hidden slug-desktop:flex h-screen p-[5px] gap-[5px] bg-background-tertiary">
            {/* Левая секция — хедер + контент */}
            <div className="flex-1 flex flex-col gap-[5px] min-w-0">
                <SearchPageHeader />
                <main className="flex-1 min-h-0">
                    {children}
                </main>
            </div>

            {/* Правый сайдбар — 400px */}
            <SearchPageSidebar />
        </div>
    );
}
