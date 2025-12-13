import { useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(
    typeof window !== "undefined"
      ? (window.localStorage.getItem("theme") as Theme) || "dark"
      : "dark"
  );

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return { theme, setTheme };
};
