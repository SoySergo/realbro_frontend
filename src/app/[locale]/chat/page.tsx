import { ChatPage as ChatPageScreen } from '@/screens/chat-page';
import { setRequestLocale } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ChatPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ChatPageScreen />;
}
