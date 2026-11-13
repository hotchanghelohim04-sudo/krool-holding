import { defineRouting } from "next-intl/routing";

import { defaultLocale, nativeLocales } from "./config";

export const routing = defineRouting({
  locales: nativeLocales,
  defaultLocale,
  // Toujours préfixer (/fr, /en) : URLs explicites et hreflang propres.
  localePrefix: "always",
});
