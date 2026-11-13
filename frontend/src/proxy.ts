import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Redirige « / » vers la langue préférée du visiteur (/fr par défaut).
export default createMiddleware(routing);

export const config = {
  // Ignore l'API, les fichiers internes de Next et les fichiers statiques.
  matcher: "/((?!api|_next|_vercel|brand|.*\\..*).*)",
};
