import { Skeleton } from "@heroui/skeleton";

export function TransactionFiltersSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}
