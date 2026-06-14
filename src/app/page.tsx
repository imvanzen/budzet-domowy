import { Suspense } from "react";
import { HiHome } from "react-icons/hi2";
import { getDashboardData } from "@/app/actions";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { getSettings } from "@/services/settings";

async function Dashboard() {
  const [dashboardData, settings] = await Promise.all([
    getDashboardData(),
    getSettings(),
  ]);

  return (
    <DashboardContent
      initialData={dashboardData}
      currency={settings.currency}
    />
  );
}

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <HiHome className="text-primary" aria-hidden />
          Budżet Domowy
        </h1>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
