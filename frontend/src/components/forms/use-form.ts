"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import type { ApiResult } from "@/lib/api";

export type Errors = Record<string, string | undefined>;

/** État minimal d'un formulaire : valeurs, erreurs par champ, envoi en cours. */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  const set = useCallback(
    <K extends keyof T>(name: K) =>
      (value: T[K]) => {
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => (current[name as string] ? { ...current, [name as string]: undefined } : current));
      },
    [],
  );

  return { values, set, setValues, errors, setErrors, pending, setPending };
}

/** Traduit l'échec d'un appel API en erreurs affichables (champs + message global). */
export function useApiErrors() {
  const t = useTranslations("Form");
  return useCallback(
    (result: Exclude<ApiResult<unknown>, { ok: true }>): Errors => {
      switch (result.kind) {
        case "validation": {
          const fields: Errors = {};
          for (const [field, messages] of Object.entries(result.fields)) fields[field] = messages[0];
          return { ...fields, form: t("errors.generic") };
        }
        case "rateLimited":
          return { form: t("errors.rateLimited") };
        case "network":
          return { form: t("errors.network") };
        default:
          return { form: t("errors.generic") };
      }
    },
    [t],
  );
}

export function hasErrors(errors: Errors) {
  return Object.values(errors).some(Boolean);
}
