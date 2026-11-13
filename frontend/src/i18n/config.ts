/**
 * Configuration des langues (CLAUDE.md §5).
 *
 * - Langues NATIVES : traduites à la main, routées (/fr, /en), indexées (hreflang).
 * - Langues AUTOMATIQUES : proposées dans le sélecteur, traduites à la demande
 *   par une API de traduction avec cache côté serveur. Implémentation : étape 7
 *   (voir docs/architecture/i18n.md et machine-translation.ts).
 */
export const nativeLocales = ["fr", "en"] as const;
export type NativeLocale = (typeof nativeLocales)[number];

export const defaultLocale: NativeLocale = "fr";

/** Langues proposées en traduction automatique (liste ajustable). */
export const machineLocales = ["es", "pt", "de", "ar", "zh"] as const;
export type MachineLocale = (typeof machineLocales)[number];

/** Langues dont le contenu juridique/technique de référence fait foi. */
export const referenceLocales: readonly NativeLocale[] = nativeLocales;

/** Langues écrites de droite à gauche (pour l'attribut dir). */
export const rtlLocales: readonly string[] = ["ar"];
