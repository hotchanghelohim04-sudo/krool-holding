import { getTranslations } from "next-intl/server";

// Page d'accueil provisoire de l'étape 0 : la vraie page arrive à l'étape 1.
export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <section className="section-y bg-ink-950 text-paper">
      <div className="container-site animate-fade-up">
        <p className="text-sm font-medium tracking-[0.2em] text-gold-500 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-6 max-w-4xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-prose text-lg text-slate-300">{t("lead")}</p>
        <p className="mt-10 inline-flex items-center gap-3 rounded-sm border border-gold-500/40 px-4 py-2 text-sm text-gold-300">
          <span aria-hidden className="size-2 rounded-full bg-gold-500" />
          {t("status")}
        </p>
      </div>
    </section>
  );
}
