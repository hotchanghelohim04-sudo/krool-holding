import { ArrowUpRight, Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getCaseStudies, getServices, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("CaseStudies");
  return pageMetadata({ locale, href: "/etudes-de-cas", title: t("title"), description: t("lead") });
}

export default async function CaseStudiesPage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, tHome, studies, services, site] = await Promise.all([
    getTranslations("CaseStudies"),
    getTranslations("Common"),
    getTranslations("Home"),
    getCaseStudies(),
    getServices(),
    getSite(),
  ]);
  const serviceTitle = (key: string) => services.find((s) => s.key === key)?.[locale].title ?? key;
  const sectorLabel = (key: string) => site.sectors.find((s) => s.key === key)?.[locale] ?? key;

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <p className="mb-10 flex max-w-3xl items-start gap-3 rounded-sm border border-ink-950/10 bg-white px-4 py-3 text-sm text-slate-600">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" strokeWidth={1.5} />
          {t("exampleNotice")}
        </p>
        <ul className="grid gap-6 lg:grid-cols-3">
          {studies.map((study) => (
            <li key={study.key} className="reveal">
              <Link
                href={{ pathname: "/etudes-de-cas/[slug]", params: { slug: study[locale].slug } }}
                className="group flex h-full flex-col rounded-lg border border-ink-950/10 bg-white p-7 transition-[border-color,box-shadow] hover:border-gold-600/50 hover:shadow-card"
              >
                <div className="flex flex-wrap gap-2 text-xs">
                  {study.isExample && <span className="rounded-xs bg-ink-950 px-2 py-0.5 text-gold-300">{tCommon("exampleBadge")}</span>}
                  <span className="rounded-xs border border-ink-950/15 px-2 py-0.5 text-slate-600">{sectorLabel(study.sector)}</span>
                </div>
                <h2 className="mt-4 text-xl leading-snug group-hover:text-gold-700">{study[locale].title}</h2>
                <p className="mt-1 text-sm text-gold-700">{serviceTitle(study.service)}</p>
                <p className="mt-3 flex-1 text-slate-600">{study[locale].summary}</p>
                <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-950/10 pt-5">
                  {study[locale].results.map((result) => (
                    <div key={result.label} className="flex flex-col-reverse">
                      <dt className="text-xs leading-snug text-slate-600">{result.label}</dt>
                      <dd className="font-serif text-2xl text-gold-700">{result.value}</dd>
                    </div>
                  ))}
                </dl>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-700">
                  {tCommon("readMore")}
                  <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={tHome("cta.title")} text={tHome("cta.lead")} />
    </>
  );
}
