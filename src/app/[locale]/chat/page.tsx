import { SidebarWrapper as Sidebar } from '@/widgets/sidebar';
import { ChatPage as ChatPageScreen } from '@/screens/chat-page';
import { setRequestLocale } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ChatPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                <ChatPageScreen />
            </main>
        </div>
    );
}
