import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { getImages, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("References");
  return pageMetadata({ locale, href: "/references", title: t("title"), description: t("lead") });
}

export default async function ReferencesPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tHome, site] = await Promise.all([getTranslations("References"), getTranslations("Home"), getSite()]);
  const sectorOf = (key: string) => site.sectors.find((s) => s.key === key);

  return (
    <>
      <PageHeader image={images.headers.references} title={t("title")} lead={t("lead")} />
      <Section tone="light" labelledBy="sectors-title">
        <SectionHeading id="sectors-title" title={t("sectorsTitle")} />
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.sectors.map((sector) => (
            <li key={sector.key} className="reveal flex items-center gap-4 rounded-lg border border-fg/10 bg-surface-raised p-5">
              <span className="inline-flex size-11 items-center justify-center rounded-md bg-ink-950 text-gold-400">
                <Icon name={sector.icon} className="size-5" />
              </span>
              {sector[locale]}
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="dark" labelledBy="projects-title">
        <SectionHeading id="projects-title" tone="dark" title={t("projectsTitle")} />
        <p className="mt-6 flex max-w-3xl items-start gap-3 text-sm text-slate-300">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={1.5} />
          {t("exampleNotice")}
        </p>
        <ul className="reveal mt-10 grid gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 md:grid-cols-2">
          {site.references.map((reference) => {
            const sector = sectorOf(reference.sector);
            return (
              <li key={reference.en} className="flex items-center gap-4 bg-ink-950 p-5">
                {sector && <Icon name={sector.icon} className="size-5 shrink-0 text-gold-500" />}
                <span>
                  <span className="block text-paper">{reference[locale]}</span>
                  {sector && <span className="text-sm text-slate-300">{sector[locale]}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
      <CtaBand title={tHome("cta.title")} text={tHome("cta.lead")} />
    </>
  );
}
