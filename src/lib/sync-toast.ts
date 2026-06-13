import { addToast, closeToast } from "@heroui/toast";

type SyncToastMessages = {
  loading: string;
  success: string;
  error: string;
};

export async function showSyncToast<T>(
  operation: () => Promise<T>,
  messages: SyncToastMessages,
): Promise<T> {
  let toastKey: string | null = null;

  const syncPromise = operation()
    .then((result) => {
      if (toastKey) closeToast(toastKey);
      addToast({
        title: messages.success,
        color: "success",
        timeout: 3000,
      });
      return result;
    })
    .catch((error: unknown) => {
      if (toastKey) closeToast(toastKey);
      addToast({
        title: messages.error,
        description: error instanceof Error ? error.message : undefined,
        color: "danger",
        timeout: 5000,
      });
      throw error;
    });

  toastKey = addToast({
    title: messages.loading,
    color: "default",
    promise: syncPromise.then(
      () => undefined,
      () => undefined,
    ),
    timeout: 0,
    hideCloseButton: true,
  });

  return syncPromise;
}

export function showSuccessToast(title: string): void {
  addToast({
    title,
    color: "success",
    timeout: 3000,
  });
}
