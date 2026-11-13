import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { findBySlug, getCaseStudies, getServices, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

// Fiches pré-rendues pour chaque slug (generateStaticParams) ; la page lit son slug
// avant tout rendu pour pouvoir rediriger vers le slug de la bonne langue.
export const instant = false;

export async function generateStaticParams() {
  const locale = (await rootLocale()) as NativeLocale;
  return (await getCaseStudies()).map((study) => ({ slug: study[locale].slug }));
}

async function resolve(slug: string) {
  const locale = (await rootLocale()) as NativeLocale;
  const found = findBySlug(await getCaseStudies(), decodeURIComponent(slug));
  if (!found) notFound();
  if (found.slugLocale !== locale) {
    permanentRedirect({
      href: { pathname: "/etudes-de-cas/[slug]", params: { slug: found.item[locale].slug } },
      locale,
    });
  }
  return { locale, study: found.item };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/etudes-de-cas/[slug]">): Promise<Metadata> {
  const { locale, study } = await resolve((await params).slug);
  return pageMetadata({
    locale,
    title: study[locale].title,
    description: study[locale].summary,
    hrefs: {
      fr: { pathname: "/etudes-de-cas/[slug]", params: { slug: study.fr.slug } },
      en: { pathname: "/etudes-de-cas/[slug]", params: { slug: study.en.slug } },
    },
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/etudes-de-cas/[slug]">) {
  const { locale, study } = await resolve((await params).slug);
  const content = study[locale];
  const [t, tCommon, tHome, services, site] = await Promise.all([
    getTranslations("CaseStudies"),
    getTranslations("Common"),
    getTranslations("Home"),
    getServices(),
    getSite(),
  ]);
  const service = services.find((s) => s.key === study.service);
  const sector = site.sectors.find((s) => s.key === study.sector);

  return (
    <>
      <PageHeader eyebrow={study.isExample ? tCommon("exampleBadge") : t("title")} title={content.title} lead={content.summary} />
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <article className="space-y-10">
            <div>
              <h2 className="text-2xl">{t("context")}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-950/85">{content.context}</p>
            </div>
            <div>
              <h2 className="text-2xl">{t("approach")}</h2>
              <ol className="mt-5 space-y-4">
                {content.approach.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-600 font-serif text-sm text-gold-700">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-ink-950/85">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
          <aside className="space-y-6">
            <dl className="rounded-lg border border-ink-950/10 bg-white p-6 text-sm">
              {[
                [t("client"), content.client],
                [t("sector"), sector?.[locale]],
                [t("year"), String(study.year)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-ink-950/10 py-3 last:border-0">
                  <dt className="text-slate-600">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
              {service && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-600">{t("service")}</dt>
                  <dd className="text-right">
                    <Link
                      href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }}
                      className="font-medium text-gold-700 underline-offset-2 hover:underline"
                    >
                      {service[locale].title}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            <div className="rounded-lg bg-ink-950 p-6 text-paper">
              <h2 className="text-xl">{t("results")}</h2>
              <dl className="mt-5 space-y-5">
                {content.results.map((result) => (
                  <div key={result.label} className="flex flex-col-reverse">
                    <dt className="text-sm text-slate-300">{result.label}</dt>
                    <dd className="font-serif text-4xl text-gold-400">{result.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
        <Link href="/etudes-de-cas" className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-gold-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
          {t("back")}
        </Link>
      </Section>
      <CtaBand title={tHome("cta.title")} text={tHome("cta.lead")} />
    </>
  );
}
