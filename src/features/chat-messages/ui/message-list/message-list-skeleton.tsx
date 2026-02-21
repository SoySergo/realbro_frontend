import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

export function MessageListSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("flex-1 overflow-y-auto px-4 py-6 space-y-4", className)}>
            {/* Отправленное сообщение */}
            <div className="flex justify-end">
                <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-16 w-64 rounded-2xl" />
                </div>
            </div>

            {/* Полученное сообщение */}
            <div className="flex justify-start">
                <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-20 w-72 rounded-2xl" />
                </div>
            </div>

            {/* Отправленное сообщение */}
            <div className="flex justify-end">
                <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                </div>
            </div>

            {/* Полученное сообщение с карточкой недвижимости */}
            <div className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                    <Skeleton className="h-16 w-80 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Отправленное сообщение */}
            <div className="flex justify-end">
                <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-14 w-56 rounded-2xl" />
                </div>
            </div>

            {/* Полученное сообщение */}
            <div className="flex justify-start">
                <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-24 w-80 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
