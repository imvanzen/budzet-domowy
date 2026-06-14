import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

const CHART_KEYS = ["expenses", "income-expense"] as const;

export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {CHART_KEYS.map((key) => (
        <Card key={key}>
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded-lg" />
          </CardHeader>
          <CardBody>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
