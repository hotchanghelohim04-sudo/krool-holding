"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { postJson } from "@/lib/api";

type State = "confirming" | "confirmed" | "invalid";

/**
 * Le jeton est à usage unique : un second envoi serait refusé et afficherait à tort
 * « lien invalide ». La requête est donc mémorisée par jeton, au niveau du module,
 * pour que toute instance du composant (remontage, mode strict) réutilise la même réponse.
 */
const confirmations = new Map<string, Promise<boolean>>();

function confirmOnce(token: string, locale: string) {
  if (!confirmations.has(token)) {
    confirmations.set(token, postJson("newsletter/confirm", { token }, locale).then((result) => result.ok));
  }
  return confirmations.get(token)!;
}

/** Confirme l'inscription à partir du jeton reçu par e-mail (?token=…). */
export function NewsletterConfirmation() {
  const t = useTranslations("NewsletterConfirm");
  const locale = useLocale();
  const token = useSearchParams().get("token");
  const [state, setState] = useState<State>(token ? "confirming" : "invalid");

  useEffect(() => {
    if (!token) return;
    let active = true;
    confirmOnce(token, locale).then((ok) => {
      if (active) setState(ok ? "confirmed" : "invalid");
    });
    return () => {
      active = false;
    };
  }, [token, locale]);

  if (state === "confirming") {
    return (
      <p role="status" className="flex items-center gap-3 text-lg">
        <LoaderCircle aria-hidden className="size-5 animate-spin text-accent" />
        {t("confirming")}
      </p>
    );
  }

  const ok = state === "confirmed";
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div role="status">
      <h2 className="flex items-center gap-3 text-2xl">
        <Icon aria-hidden className={ok ? "size-7 text-success-fg" : "size-7 text-danger-fg"} strokeWidth={1.5} />
        {ok ? t("confirmedTitle") : t("invalidTitle")}
      </h2>
      <p className="mt-3 text-lg text-fg-muted">{ok ? t("confirmedText") : t("invalidText")}</p>
      <ButtonLink href="/" variant="outline-dark" className="mt-8">
        {t("backHome")}
      </ButtonLink>
    </div>
  );
}
