import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { TransactionFiltersSkeleton } from "./TransactionFiltersSkeleton";
import { TransactionListSkeleton } from "./TransactionListSkeleton";

export function TransactionsSkeleton() {
  return (
    <Card role="status" aria-busy="true" aria-label="Ładowanie transakcji">
      <CardHeader>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <TransactionFiltersSkeleton />
        <TransactionListSkeleton />
      </CardBody>
    </Card>
  );
}
