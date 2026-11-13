import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { routing } from "./routing";

// La langue est lue depuis le segment racine [locale] (compatible cacheComponents),
// sauf si l'appelant la fournit explicitement (route handlers comme l'image Open Graph,
// où next/root-params n'est pas encore disponible).
export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const requested = explicitLocale ?? (await rootLocale());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Africa/Douala",
  };
});
