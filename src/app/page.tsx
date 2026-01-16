import { Suspense } from "react";
import { getDashboardData } from "@/app/actions";
import { getSettings } from "@/services/settings";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

async function Dashboard() {
  const [dashboardData, settings] = await Promise.all([
    getDashboardData(),
    getSettings(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budżet Domowy</h1>
      </div>

      <DashboardContent initialData={dashboardData} currency={settings.currency} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
