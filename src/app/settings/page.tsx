import { Suspense } from "react";
import { getSettings } from "@/services/settings";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { SettingsForm } from "@/components/settings/SettingsForm";

async function SettingsContent() {
  const settings = await getSettings();

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ustawienia</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Waluta domyślna</h2>
        </CardHeader>
        <CardBody>
          <SettingsForm initialCurrency={settings.currency} />
        </CardBody>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

