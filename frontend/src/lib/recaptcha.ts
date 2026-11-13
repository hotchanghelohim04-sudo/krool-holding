/**
 * Google reCAPTCHA v3 (invisible, par score) pour les formulaires publics.
 *
 * - Inactif si NEXT_PUBLIC_RECAPTCHA_SITE_KEY est vide (développement) : jeton vide,
 *   et le serveur ne vérifie rien tant que RECAPTCHA_SECRET_KEY est vide aussi.
 * - Le script Google n'est chargé qu'au premier contact avec un formulaire
 *   (preloadRecaptcha), jamais au chargement des pages : performance et vie privée.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

interface Grecaptcha {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loading: Promise<Grecaptcha> | null = null;

export const recaptchaEnabled = SITE_KEY !== "";

function load(): Promise<Grecaptcha> {
  if (loading) return loading;
  loading = new Promise<Grecaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.async = true;
    script.onload = () => window.grecaptcha?.ready(() => resolve(window.grecaptcha!));
    script.onerror = () => {
      loading = null; // nouvel essai possible au prochain envoi
      reject(new Error("reCAPTCHA indisponible"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** À appeler au premier focus d'un formulaire : le script est prêt avant l'envoi. */
export function preloadRecaptcha() {
  if (recaptchaEnabled) load().catch(() => {});
}

/**
 * Jeton à joindre à l'envoi (champ « captcha »). Chaîne vide si reCAPTCHA est inactif
 * ou indisponible : le serveur décidera (il refuse si la vérification est exigée).
 */
export async function getCaptchaToken(action: string): Promise<string> {
  if (!recaptchaEnabled) return "";
  try {
    const grecaptcha = await load();
    return await grecaptcha.execute(SITE_KEY, { action });
  } catch {
    return "";
  }
}
