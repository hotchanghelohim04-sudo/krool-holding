import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { getFaq, getImages } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Faq");
  return pageMetadata({ locale, href: "/faq", title: t("title"), description: t("lead") });
}

export default async function FaqPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tNav, faq] = await Promise.all([getTranslations("Faq"), getTranslations("Nav"), getFaq()]);
  const items = faq[locale];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <PageHeader image={images.headers.faq} title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          {/* Accordéon natif <details> : accessible et sans JavaScript */}
          <div className="divide-y divide-fg/10 border-y border-fg/10">
            {items.map((item) => (
              <details key={item.q} className="group py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-medium marker:content-none hover:text-accent [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus aria-hidden className="size-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
                </summary>
                <p className="pb-5 leading-relaxed text-fg-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <aside className="h-fit rounded-lg bg-ink-950 p-7 text-paper lg:sticky lg:top-24">
            <h2 className="text-2xl">{t("moreTitle")}</h2>
            <p className="mt-3 text-slate-300">{t("moreText")}</p>
            <div className="mt-6 grid gap-3">
              <ButtonLink href="/contact">{tNav("contact")}</ButtonLink>
              <ButtonLink href="/rendez-vous" variant="outline">
                {tNav("appointment")}
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
