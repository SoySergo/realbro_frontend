import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

interface MessageListSkeletonProps {
    className?: string;
}

// Компонент скелетона для загрузки списка сообщений
export function MessageListSkeleton({ className }: MessageListSkeletonProps) {
    return (
        <div className={cn('flex-1 overflow-hidden px-4 py-2 space-y-4', className)}>
            {/* Дата сепаратор */}
            <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-border" />
                <Skeleton className="h-3 w-16" />
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Входящее сообщение */}
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-16 w-64 rounded-2xl" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>

            {/* Исходящее сообщение */}
            <div className="flex justify-end">
                <div className="flex flex-col gap-1 items-end">
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>

            {/* Входящее сообщение */}
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-20 w-56 rounded-2xl" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>

            {/* Property card skeleton */}
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-48 w-80 rounded-xl" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
}
