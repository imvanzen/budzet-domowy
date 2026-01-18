import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { Providers } from "@/components/providers";

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => <Providers>{children}</Providers>,
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
