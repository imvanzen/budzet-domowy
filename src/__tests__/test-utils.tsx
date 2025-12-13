import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { Providers } from "@/components/providers";

/**
 * Custom render function that wraps components with necessary providers.
 * Use this instead of the default render from @testing-library/react.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => <Providers>{children}</Providers>,
    ...options,
  });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
export { customRender as render };
