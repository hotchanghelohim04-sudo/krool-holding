import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { QuoteForm } from "@/components/forms/quote-form";
import { ClientMessages } from "@/components/i18n/client-messages";
import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import { getImages, getServices, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Quote");
  return pageMetadata({ locale, href: "/devis", title: t("title"), description: t("lead") });
}

export default async function QuotePage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, services, site] = await Promise.all([getTranslations("Quote"), getServices(), getSite()]);

  return (
    <>
      <PageHeader image={images.headers.quote} title={t("title")} lead={t("lead")} />
      <div className="bg-surface">
        <div className="container-site grid gap-12 py-14 sm:py-20 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-fg/10 bg-surface-raised p-6 shadow-card sm:p-10">
            <ClientMessages namespaces={["Form", "Quote"]}>
              <QuoteForm
                services={services.map((s) => ({ value: s.key, label: s[locale].title }))}
                sectors={site.sectors.map((s) => ({ value: s.key, label: s[locale] }))}
              />
            </ClientMessages>
          </div>
          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="rounded-lg bg-ink-950 p-7 text-paper">
              <h2 className="text-xl">{t("asideTitle")}</h2>
              <ol className="mt-5 space-y-4">
                {(["one", "two", "three"] as const).map((key, index) => (
                  <li key={key} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-500 font-serif text-sm text-gold-400">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-slate-300">{t(`asideSteps.${key}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="flex items-start gap-3 text-sm text-fg-muted">
              <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} />
              {t("confidential")}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
