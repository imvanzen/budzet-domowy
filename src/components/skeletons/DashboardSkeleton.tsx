import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { DashboardChartsSkeleton } from "./DashboardChartsSkeleton";
import { SummaryCardsSkeleton } from "./SummaryCardsSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Ładowanie dashboardu">
      <Card>
        <CardBody>
          <Skeleton className="h-14 w-full max-w-sm rounded-lg" />
        </CardBody>
      </Card>

      <SummaryCardsSkeleton />
      <DashboardChartsSkeleton />
    </div>
  );
}
