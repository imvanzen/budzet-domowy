export type ActionResult<T = never> =
  | (T extends never ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
