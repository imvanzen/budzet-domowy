import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

const CATEGORY_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4"] as const;

export function CategoriesSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Ładowanie kategorii"
    >
      <Card className="lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-7 w-44 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-4">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-7 w-36 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-2">
          {CATEGORY_ROW_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-default-200 p-4"
            >
              <Skeleton className="h-5 w-40 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-14 rounded-lg" />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
