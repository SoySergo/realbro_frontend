import { ChatPage as ChatPageScreen } from '@/screens/chat-page';
import { setRequestLocale } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ChatPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <main className="flex-1 md:ml-14 pb-16 md:pb-0 md:pt-[52px] min-h-screen overflow-x-hidden">
            <ChatPageScreen />
        </main>
    );
}
