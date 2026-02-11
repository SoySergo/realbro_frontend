import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

interface AIAgentPropertyFeedSkeletonProps {
    className?: string;
}

// Компонент скелетона для загрузки AI Property Feed
export function AIAgentPropertyFeedSkeleton({ className }: AIAgentPropertyFeedSkeletonProps) {
    return (
        <div className={cn('flex flex-col flex-1 min-h-0', className)}>
            {/* Filter bar skeleton */}
            <div className="px-3 md:px-4 py-2 space-y-2 border-b border-border bg-background shrink-0">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-8 w-full max-w-xs" />
            </div>

            {/* Property cards skeleton */}
            <div className="flex-1 overflow-hidden px-3 md:px-4 py-3 space-y-4">
                {/* Group header */}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>

                {/* Property card 1 */}
                <div className="space-y-2">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>

                {/* Group header */}
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>

                {/* Property card 2 */}
                <div className="space-y-2">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>

                {/* Property card 3 */}
                <div className="space-y-2">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
