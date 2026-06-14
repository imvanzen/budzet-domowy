import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

const SUMMARY_CARD_KEYS = ["income", "expense", "balance"] as const;

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SUMMARY_CARD_KEYS.map((key) => (
        <Card key={key}>
          <CardBody className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-16 rounded-lg" />
            <Skeleton className="mx-auto h-8 w-32 rounded-lg" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
