export type FlexThemeClass = "flexlayout__theme_alpha_light" | "flexlayout__theme_alpha_dark";

/**
 * Chọn FlexLayout theme class dựa trên theme string.
 * Khớp với data-theme attribute trong web.
 */
export function flexThemeClass(theme: "light" | "dark"): FlexThemeClass {
  return theme === "dark" ? "flexlayout__theme_alpha_dark" : "flexlayout__theme_alpha_light";
}

/**
 * CSS custom properties overrides để đồng bộ FlexLayout với CSS variables của web.
 * Set trên container chứa <Layout>.
 */
export function flexCssOverrides(theme: "light" | "dark"): Record<string, string> {
  if (theme === "dark") {
    return {
      "--flexlayout-color-1": "#0f1117",
      "--flexlayout-color-2": "#161923",
      "--flexlayout-color-3": "#1b1f2b",
      "--flexlayout-color-4": "#222636",
      "--flexlayout-color-5": "#2a2e42",
      "--flexlayout-color-6": "#e6e6f0",
      "--flexlayout-color-text": "#e6e6f0",
      "--flexlayout-color-text-secondary": "#a0a4b8",
      "--flexlayout-tab-text-color": "#a0a4b8",
      "--flexlayout-tab-selected-text-color": "#e6e6f0",
      "--flexlayout-splitter-color": "#2a2e3f",
      "--flexlayout-tabset-background": "#0f1117",
    };
  }
  return {
    "--flexlayout-color-1": "#f7f7f8",
    "--flexlayout-color-2": "#ffffff",
    "--flexlayout-color-3": "#ffffff",
    "--flexlayout-color-4": "#f0f0f1",
    "--flexlayout-color-5": "#e8e8ea",
    "--flexlayout-color-6": "#1a1a2e",
    "--flexlayout-color-text": "#1a1a2e",
    "--flexlayout-color-text-secondary": "#5a5a6e",
    "--flexlayout-tab-text-color": "#5a5a6e",
    "--flexlayout-tab-selected-text-color": "#1a1a2e",
    "--flexlayout-splitter-color": "#e4e4e7",
    "--flexlayout-tabset-background": "#f7f7f8",
  };
}