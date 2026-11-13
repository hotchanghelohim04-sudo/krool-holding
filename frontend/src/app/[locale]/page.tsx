import { ArrowRight, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { BowTieDiagram } from "@/components/diagrams/bow-tie";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getAcademy, getCaseStudies, getServices, getSite } from "@/lib/content";
import { cn } from "@/lib/utils";

// Largeur des cartes de services dans la grille Bento (6 colonnes) : rythme asymétrique.
const BENTO_SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-4", "md:col-span-3", "md:col-span-3"];

export default async function HomePage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, tDiagrams, tAcademy] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Common"),
    getTranslations("Diagrams"),
    getTranslations("Academy"),
  ]);
  const [services, site, academy, caseStudies] = await Promise.all([
    getServices(),
    getSite(),
    getAcademy(),
    getCaseStudies(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950 text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-gold-500)_1px,transparent_1px),linear-gradient(90deg,var(--color-gold-500)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
        />
        <div className="relative container-site grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">{t("hero.eyebrow")}</p>
            <h1 className="mt-5 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              <span className="text-gold-gradient">{t("hero.title")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">{t("hero.lead")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/devis" size="lg">
                {t("hero.ctaQuote")}
                <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
              </ButtonLink>
              <ButtonLink href="/academie" size="lg" variant="outline">
                {t("hero.ctaAcademy")}
              </ButtonLink>
            </div>
          </div>
          <div className="relative rounded-xl border border-ink-800 bg-ink-900/60 p-4 sm:p-6">
            <BowTieDiagram
              title={t("hero.diagramLabel")}
              labels={{
                threats: tDiagrams("bowTie.threats"),
                event: tDiagrams("bowTie.event"),
                consequences: tDiagrams("bowTie.consequences"),
                prevention: tDiagrams("bowTie.prevention"),
                protection: tDiagrams("bowTie.protection"),
              }}
            />
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section aria-labelledby="stats-title" className="border-y border-ink-800 bg-ink-900 text-paper">
        <h2 id="stats-title" className="sr-only">
          {t("stats.title")}
        </h2>
        <dl className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4">
          {site.stats.map((stat) => (
            <div key={stat.en} className="flex flex-col-reverse border-l border-gold-500/40 pl-5">
              <dt className="mt-2 text-sm text-slate-300">{stat[locale]}</dt>
              <dd className="font-serif text-4xl text-gold-400 sm:text-5xl">
                <NumberTicker value={stat.value} locale={locale} />
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* SERVICES — grille Bento */}
      <Section tone="light" labelledBy="services-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="services-title" eyebrow={t("services.eyebrow")} title={t("services.title")} lead={t("services.lead")} />
          <ButtonLink href="/services" variant="outline-dark" className="shrink-0">
            {t("services.cta")}
          </ButtonLink>
        </div>
        <BentoGrid className="reveal mt-12">
          {services.map((service, index) => (
            <BentoCard
              key={service.key}
              className={BENTO_SPANS[index]}
              title={service[locale].title}
              description={service[locale].short}
              icon={<Icon name={service.icon} className="size-5" />}
              href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }}
              cta={tCommon("learnMore")}
              background={
                index === 0 ? (
                  <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(var(--color-gold-500)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent)]" />
                ) : undefined
              }
            />
          ))}
        </BentoGrid>
      </Section>

      {/* SECTEURS */}
      <Section tone="dark" labelledBy="sectors-title">
        <SectionHeading id="sectors-title" tone="dark" eyebrow={t("sectors.eyebrow")} title={t("sectors.title")} lead={t("sectors.lead")} />
        <ul className="reveal mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 sm:grid-cols-2 lg:grid-cols-3">
          {site.sectors.map((sector) => (
            <li key={sector.key} className="group flex items-center gap-4 bg-ink-950 p-6 transition-colors hover:bg-ink-900">
              <Icon name={sector.icon} className="size-6 text-gold-500 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-paper">{sector[locale]}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* MÉTHODE */}
      <Section tone="light" labelledBy="method-title">
        <SectionHeading id="method-title" eyebrow={t("method.eyebrow")} title={t("method.title")} lead={t("method.lead")} />
        <ol className="reveal relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute top-5 right-[12%] left-[12%] hidden h-px bg-gold-600/40 md:block" />
          {site.method.map((step, index) => (
            <li key={step.en.title} className="relative">
              <span className="relative z-10 flex size-10 rotate-45 items-center justify-center border border-gold-600 bg-paper">
                <span className="-rotate-45 font-serif text-gold-700">{index + 1}</span>
              </span>
              <h3 className="mt-6 text-xl">{step[locale].title}</h3>
              <p className="mt-2 text-slate-600">{step[locale].text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* RÉFÉRENCES */}
      <Section tone="white" labelledBy="references-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="references-title" eyebrow={t("references.eyebrow")} title={t("references.title")} lead={t("references.lead")} />
          <ButtonLink href="/etudes-de-cas" variant="outline-dark" className="shrink-0">
            {t("references.cta")}
          </ButtonLink>
        </div>
        <Marquee className="mt-10">
          {site.references.map((reference) => (
            <span key={reference.en} className="rounded-sm border border-ink-950/10 bg-paper px-4 py-2 text-sm whitespace-nowrap text-slate-600">
              {reference[locale]}
            </span>
          ))}
        </Marquee>
        <ul className="reveal mt-10 grid gap-6 md:grid-cols-3">
          {caseStudies.map((study) => (
            <li key={study.key}>
              <Link
                href={{ pathname: "/etudes-de-cas/[slug]", params: { slug: study[locale].slug } }}
                className="group flex h-full flex-col rounded-lg border border-ink-950/10 bg-paper p-6 transition-[border-color,box-shadow] hover:border-gold-600/50 hover:shadow-card"
              >
                {study.isExample && (
                  <span className="self-start rounded-xs bg-ink-950/5 px-2 py-0.5 text-xs text-slate-600">{tCommon("exampleBadge")}</span>
                )}
                <h3 className="mt-3 text-lg leading-snug group-hover:text-gold-700">{study[locale].title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{study[locale].summary}</p>
                <p className="mt-5 font-serif text-3xl text-gold-700">{study[locale].results[0].value}</p>
                <p className="text-sm text-slate-600">{study[locale].results[0].label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ACADÉMIE */}
      <Section tone="dark" labelledBy="academy-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading id="academy-title" tone="dark" eyebrow={t("academy.eyebrow")} title={t("academy.title")} lead={t("academy.lead")} />
            <ButtonLink href="/academie" size="lg" className="mt-8">
              {t("academy.cta")}
            </ButtonLink>
          </div>
          <ol className="reveal space-y-3">
            {academy.courses.map((course, index) => (
              <li key={course.key} className="flex items-center gap-4 rounded-lg border border-ink-800 bg-ink-900 p-4">
                <span className="font-serif text-2xl text-gold-500/70 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block text-paper">{course[locale].title}</span>
                  <span className="text-sm text-slate-300">
                    {tAcademy(`levels.${course.level}`)} · {tAcademy("hours", { hours: course.hours })}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* TÉMOIGNAGES */}
      <Section tone="light" labelledBy="testimonials-title">
        <SectionHeading id="testimonials-title" eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} align="center" className="mx-auto" />
        <ul className="reveal mt-12 grid gap-6 md:grid-cols-3">
          {site.testimonials.map((item) => (
            <li key={item.en.quote}>
              <figure className="flex h-full flex-col rounded-lg border border-ink-950/10 bg-white p-6 shadow-card">
                <Quote aria-hidden className="size-6 text-gold-600" strokeWidth={1.5} />
                <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed">{item[locale].quote}</blockquote>
                <figcaption className="mt-6 border-t border-ink-950/10 pt-4 text-sm">
                  <span className="block font-medium">{item[locale].author}</span>
                  <span className={cn("text-slate-600")}>{item[locale].company}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title={t("cta.title")} text={t("cta.lead")} />
    </>
  );
}
