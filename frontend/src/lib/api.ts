/**
 * Appels à l'API Django depuis le navigateur (même origine : /api/...).
 * Les erreurs sont ramenées à quelques cas que l'interface sait afficher.
 */

export type FieldErrors = Record<string, string[]>;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "validation"; fields: FieldErrors }
  | { ok: false; kind: "conflict"; code?: string }
  | { ok: false; kind: "rateLimited" }
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server" };

async function request<T>(path: string, init: RequestInit, locale: string): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      ...init,
      headers: { Accept: "application/json", "Accept-Language": locale, ...init.headers },
      credentials: "omit", // aucune session ni cookie pour les formulaires publics
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  const body = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, data: body as T };
  if (response.status === 400) return { ok: false, kind: "validation", fields: normalizeErrors(body) };
  if (response.status === 409) return { ok: false, kind: "conflict", code: body?.code };
  if (response.status === 429) return { ok: false, kind: "rateLimited" };
  return { ok: false, kind: "server" };
}

function normalizeErrors(body: unknown): FieldErrors {
  if (!body || typeof body !== "object") return {};
  const result: FieldErrors = {};
  for (const [field, value] of Object.entries(body as Record<string, unknown>)) {
    if (Array.isArray(value)) result[field] = value.map(String);
    else if (typeof value === "string") result[field] = [value];
  }
  return result;
}

export function postJson<T>(path: string, payload: unknown, locale: string) {
  return request<T>(
    path,
    { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } },
    locale,
  );
}

/** Envoi multipart (pièces jointes). Le navigateur fixe lui-même le Content-Type. */
export function postForm<T>(path: string, form: FormData, locale: string) {
  return request<T>(path, { method: "POST", body: form }, locale);
}

export function getJson<T>(path: string, locale: string) {
  return request<T>(path, { method: "GET" }, locale);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9 ().-]{6,30}$/;
