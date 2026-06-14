import { Skeleton } from "@heroui/skeleton";

const DEFAULT_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

type TransactionListSkeletonProps = {
  rows?: number;
};

export function TransactionListSkeleton({ rows = 5 }: TransactionListSkeletonProps) {
  const rowKeys = DEFAULT_ROW_KEYS.slice(0, rows);

  return (
    <div className="space-y-2" aria-hidden="true">
      {rowKeys.map((key) => (
        <div
          key={key}
          className="flex items-center justify-between gap-4 rounded-lg border border-default-200 p-4"
        >
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
