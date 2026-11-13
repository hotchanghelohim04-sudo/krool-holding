import { Clock, Languages } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { RiskMatrix } from "@/components/diagrams/risk-matrix";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { ClientMessages } from "@/components/i18n/client-messages";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { getAcademy, getImages } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

const LEVEL_STYLE = {
  beginner: "border-success/40 text-success-fg",
  intermediate: "border-warning/40 text-warning-fg",
  advanced: "border-danger/40 text-danger-fg",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Academy");
  return pageMetadata({ locale, href: "/academie", title: t("title"), description: t("lead") });
}

export default async function AcademyPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tDiagrams, academy] = await Promise.all([
    getTranslations("Academy"),
    getTranslations("Diagrams"),
    getAcademy(),
  ]);

  return (
    <>
      <PageHeader image={images.headers.academy} title={t("title")} lead={t("lead")}>
        <span className="mt-6 inline-flex items-center gap-2 rounded-sm border border-gold-500/40 px-3 py-1.5 text-sm text-gold-300">
          <span aria-hidden className="size-2 rounded-full bg-gold-500 motion-safe:animate-pulse" />
          {t("badge")}
        </span>
      </PageHeader>

      <Section tone="light" labelledBy="features-title">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <SectionHeading id="features-title" title={t("featuresTitle")} />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {academy.features.map((feature) => (
                <li key={feature.en.title} className="reveal">
                  <span className="inline-flex size-11 items-center justify-center rounded-md bg-ink-950 text-gold-400">
                    <Icon name={feature.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg">{feature[locale].title}</h3>
                  <p className="mt-1.5 text-sm text-fg-muted">{feature[locale].text}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* Aperçu d'un mini-lab : la matrice de risques interactive de la Phase 2 */}
          <div className="reveal rounded-lg border border-fg/10 bg-surface-raised p-6 shadow-card">
            <RiskMatrix
              labels={{
                title: tDiagrams("riskMatrix.title"),
                likelihood: tDiagrams("riskMatrix.likelihood"),
                severity: tDiagrams("riskMatrix.severity"),
                legend: tDiagrams("riskMatrix.legend"),
                low: tDiagrams("riskMatrix.low"),
                medium: tDiagrams("riskMatrix.medium"),
                high: tDiagrams("riskMatrix.high"),
              }}
            />
          </div>
        </div>
      </Section>

      <Section tone="alt" labelledBy="catalog-title">
        <SectionHeading id="catalog-title" title={t("catalogTitle")} lead={t("catalogLead")} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {academy.courses.map((course, index) => (
            <li key={course.key} className="reveal flex flex-col rounded-lg border border-fg/10 bg-surface-raised p-6">
              <div className="flex items-center justify-between">
                <span className="font-serif text-3xl text-accent/70 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className={cn("rounded-xs border px-2 py-0.5 text-xs font-medium", LEVEL_STYLE[course.level])}>
                  {t(`levels.${course.level}`)}
                </span>
              </div>
              <h3 className="mt-4 text-xl leading-snug">{course[locale].title}</h3>
              <p className="mt-2 flex-1 text-sm text-fg-muted">{course[locale].summary}</p>
              <p className="mt-5 flex gap-4 border-t border-fg/10 pt-4 text-sm text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="size-4 text-accent" strokeWidth={1.5} />
                  {t("hours", { hours: course.hours })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages aria-hidden className="size-4 text-accent" strokeWidth={1.5} />
                  {t("languages")}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark" labelledBy="waitlist-title" id="liste-attente">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="waitlist-title" tone="dark" title={t("waitlistTitle")} lead={t("waitlistLead")} />
          <div className="mt-10 rounded-lg border border-ink-800 bg-ink-900 p-6 sm:p-8">
            <ClientMessages namespaces={["Form", "Academy"]}>
              <WaitlistForm />
            </ClientMessages>
          </div>
        </div>
      </Section>
    </>
  );
}
