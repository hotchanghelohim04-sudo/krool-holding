import type { MachineLocale, NativeLocale } from "./config";

/**
 * Contrat de la traduction automatique (implémentation : étape 7).
 *
 * Le front n'appellera jamais directement le prestataire de traduction :
 * il interrogera l'API Django, qui traduit depuis une langue native,
 * met le résultat en cache (modèle `Translation`) et le renvoie.
 * Changer de prestataire (DeepL, Google, LibreTranslate…) ne touchera
 * que le backend.
 */
export interface MachineTranslationRequest {
  /** Clé stable du contenu (ex. « page:accueil:hero ») pour le cache. */
  key: string;
  source: NativeLocale;
  target: MachineLocale;
  text: string;
}

export interface MachineTranslationResult {
  key: string;
  target: MachineLocale;
  text: string;
  /** Vrai si le texte provient du cache serveur. */
  cached: boolean;
}

export interface MachineTranslator {
  translate(requests: MachineTranslationRequest[]): Promise<MachineTranslationResult[]>;
}
