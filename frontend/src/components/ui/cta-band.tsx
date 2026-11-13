import { getTranslations } from "next-intl/server";

import { ButtonLink } from "./button";

/** Bandeau d'appel à l'action (devis + rendez-vous). */
export async function CtaBand({ title, text }: { title: string; text: string }) {
  const t = await getTranslations("Nav");
  return (
    <section className="bg-surface">
      <div className="container-site py-16 sm:py-20">
        <div className="reveal relative overflow-hidden rounded-xl border border-gold-600/30 bg-ink-950 px-6 py-12 text-paper sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rotate-45 border border-gold-500/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-12 -right-12 size-48 rotate-45 border border-gold-500/30"
          />
          <h2 className="relative max-w-2xl text-3xl leading-tight sm:text-4xl">{title}</h2>
          <p className="relative mt-4 max-w-xl text-lg text-slate-300">{text}</p>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/devis" size="lg">
              {t("quote")}
            </ButtonLink>
            <ButtonLink href="/rendez-vous" size="lg" variant="outline">
              {t("appointment")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
