import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * Pose data-theme sur <html> AVANT l'affichage (évite un flash de mauvais thème) :
 * choix enregistré du visiteur, sinon préférence de son système.
 * Script en ligne volontairement minuscule et sans donnée variable.
 */
const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
