import { Check } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { BowTieDiagram } from "@/components/diagrams/bow-tie";
import { RiskMatrix } from "@/components/diagrams/risk-matrix";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { findBySlug, getCaseStudies, getServices } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/metadata";

// Schéma technique illustrant la démarche : matrice de criticité ou nœud papillon.
const WITH_RISK_MATRIX = new Set(["hazard-studies"]);
const WITH_BOW_TIE = new Set(["industrial-safety"]);

// Fiches pré-rendues pour chaque slug (generateStaticParams) ; la page lit son slug
// avant tout rendu pour pouvoir rediriger vers le slug de la bonne langue.
export const instant = false;

export async function generateStaticParams() {
  const locale = (await rootLocale()) as NativeLocale;
  return (await getServices()).map((service) => ({ slug: service[locale].slug }));
}

async function resolve(slug: string) {
  const locale = (await rootLocale()) as NativeLocale;
  const found = findBySlug(await getServices(), decodeURIComponent(slug));
  if (!found) notFound();
  // Slug de l'autre langue (ex. après un changement de langue) : redirection vers le bon.
  if (found.slugLocale !== locale) {
    permanentRedirect({ href: { pathname: "/services/[slug]", params: { slug: found.item[locale].slug } }, locale });
  }
  return { locale, service: found.item };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, service } = await resolve((await params).slug);
  return pageMetadata({
    locale,
    title: service[locale].title,
    description: service[locale].summary,
    hrefs: {
      fr: { pathname: "/services/[slug]", params: { slug: service.fr.slug } },
      en: { pathname: "/services/[slug]", params: { slug: service.en.slug } },
    },
  });
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, service } = await resolve((await params).slug);
  const content = service[locale];
  const [t, tNav, tCommon, tDiagrams, services, caseStudies] = await Promise.all([
    getTranslations("Services"),
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Diagrams"),
    getServices(),
    getCaseStudies(),
  ]);
  const related = caseStudies.filter((study) => study.service === service.key);
  const others = services.filter((s) => s.key !== service.key).slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: content.title,
          description: content.summary,
          serviceType: content.title,
          areaServed: ["Cameroon", "CEMAC"],
          provider: { "@type": "Organization", name: "Krool Holding", url: absoluteUrl(`/${locale}`) },
        }}
      />
      <PageHeader eyebrow={tNav("services")} title={content.title} lead={content.summary} image={service.image}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/devis" size="lg">
            {tNav("quote")}
          </ButtonLink>
          <ButtonLink href="/rendez-vous" size="lg" variant="outline">
            {tNav("appointment")}
          </ButtonLink>
        </div>
      </PageHeader>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex size-12 items-center justify-center rounded-md bg-ink-950 text-gold-400">
              <Icon name={service.icon} className="size-6" />
            </span>
            <p className="mt-6 font-serif text-2xl leading-snug">{content.intro}</p>
            {WITH_RISK_MATRIX.has(service.key) && (
              <div className="mt-10">
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
            )}
            {WITH_BOW_TIE.has(service.key) && (
              <div className="mt-10 rounded-xl border border-ink-800 bg-ink-950 p-4 sm:p-6">
                <BowTieDiagram
                  title={tDiagrams("bowTie.event")}
                  labels={{
                    threats: tDiagrams("bowTie.threats"),
                    event: tDiagrams("bowTie.event"),
                    consequences: tDiagrams("bowTie.consequences"),
                    prevention: tDiagrams("bowTie.prevention"),
                    protection: tDiagrams("bowTie.protection"),
                  }}
                />
              </div>
            )}
          </div>
          {/* Pas d'animation de révélation : bloc visible dès le chargement. */}
          <div className="rounded-lg border border-fg/10 bg-surface-raised p-7 shadow-card">
            <h2 className="text-2xl">{t("deliverables")}</h2>
            <ul className="mt-5 space-y-3">
              {content.deliverables.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-8 text-lg">{t("standards")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {content.standards.map((standard) => (
                <li key={standard} className="rounded-xs border border-fg/15 px-2.5 py-1 text-xs text-fg-muted">
                  {standard}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Démarche : schéma de processus en 4 temps */}
      <Section tone="dark" labelledBy="approach-title">
        <SectionHeading id="approach-title" tone="dark" title={t("approach")} />
        <ol className="reveal mt-12 grid gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 md:grid-cols-4">
          {content.approach.map((step, index) => (
            <li key={step.title} className="bg-ink-950 p-6">
              <span className="font-serif text-4xl text-gold-500/60 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg text-paper">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {(related.length > 0 || others.length > 0) && (
        <Section tone="alt">
          {related.length > 0 && (
            <div className="mb-14">
              <h2 className="text-2xl">{t("relatedCases")}</h2>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {related.map((study) => (
                  <li key={study.key}>
                    <Link
                      href={{ pathname: "/etudes-de-cas/[slug]", params: { slug: study[locale].slug } }}
                      className="block rounded-lg border border-fg/10 p-5 transition-colors hover:border-gold-600/50"
                    >
                      {study.isExample && <span className="text-xs text-fg-muted">{tCommon("exampleBadge")}</span>}
                      <span className="mt-1 block font-medium hover:text-accent">{study[locale].title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h2 className="text-2xl">{t("otherServices")}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => (
              <li key={other.key}>
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: other[locale].slug } }}
                  className="flex h-full items-start gap-3 rounded-lg border border-fg/10 p-5 transition-colors hover:border-gold-600/50"
                >
                  <Icon name={other.icon} className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium">{other[locale].title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand title={t("ctaTitle")} text={t("ctaText")} />
    </>
  );
}
