import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { locale as rootLocale } from "next/root-params";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { PartnersMarquee } from "@/components/sections/partners-marquee";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getAbout, getAcademy, getCaseStudies, getImages, getServices, getSite } from "@/lib/content";

// Largeur des cartes de services dans la grille Bento (6 colonnes) : rythme asymétrique.
const BENTO_SPANS = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
  "md:col-span-3",
  "md:col-span-3",
];

export default async function HomePage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tNav, tCommon, tAcademy] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Academy"),
  ]);
  const [services, site, academy, caseStudies, images, about] = await Promise.all([
    getServices(),
    getSite(),
    getAcademy(),
    getCaseStudies(),
    getImages(),
    getAbout(),
  ]);

  return (
    <>
      {/* HERO — photo plein cadre sous voile noir, comme bakerrisk.com */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-ink-950 text-paper">
        <Image
          src={images.hero}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          preload
          className="-z-10 object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black to-transparent" />
        <div className="container-site py-20">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-sm font-semibold tracking-[0.25em] text-gold-400 uppercase">{t("hero.eyebrow")}</p>
            <h1 className="mt-6 text-4xl leading-[1.08] font-medium sm:text-6xl lg:text-7xl">{t("hero.title")}</h1>
            <p className="mt-7 max-w-2xl text-lg text-white/85 sm:text-xl">{t("hero.lead")}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/devis" size="lg">
                {t("hero.ctaQuote")}
                <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
              </ButtonLink>
              <ButtonLink href="/academie" size="lg" variant="outline" className="border-white/60 text-white hover:border-gold-400 hover:text-gold-300">
                {t("hero.ctaAcademy")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section aria-labelledby="stats-title" className="bg-ink-950 text-paper">
        <h2 id="stats-title" className="sr-only">
          {t("stats.title")}
        </h2>
        <dl className="container-site grid grid-cols-2 gap-x-6 gap-y-10 border-b border-ink-800 py-12 lg:grid-cols-4">
          {site.stats.map((stat) => (
            <div key={stat.en} className="flex flex-col-reverse border-l-2 border-gold-500 pl-5">
              <dt className="mt-2 text-sm text-slate-300">{stat[locale]}</dt>
              <dd className="font-serif text-4xl text-gold-400 sm:text-5xl">
                <NumberTicker value={stat.value} locale={locale} />
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* LE CABINET — bloc texte + photo (Douala) */}
      <Section tone="light" labelledBy="firm-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading id="firm-title" eyebrow={t("firm.eyebrow")} title={t("firm.title")} lead={about[locale].lead} />
            <p className="mt-5 text-fg-muted">{about[locale].mission}</p>
            <ButtonLink href="/a-propos" variant="outline-dark" size="lg" className="mt-8">
              {t("firm.cta")}
            </ButtonLink>
          </div>
          <div className="reveal relative aspect-[4/3] overflow-hidden rounded-xl shadow-card">
            <Image src={images.home.firm} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={70} className="object-cover" />
            <div aria-hidden className="absolute inset-0 rounded-xl ring-1 ring-fg/10 ring-inset" />
          </div>
        </div>
      </Section>

      {/* SERVICES — grille Bento illustrée */}
      <Section tone="alt" labelledBy="services-title">
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
              image={service.image}
              sizes={BENTO_SPANS[index] === "md:col-span-2" ? "(min-width: 768px) 33vw, 100vw" : "(min-width: 768px) 66vw, 100vw"}
            />
          ))}
        </BentoGrid>
      </Section>

      {/* SECTEURS — sur fond photo */}
      <section aria-labelledby="sectors-title" className="section-y relative isolate overflow-hidden bg-ink-950 text-paper">
        <Image src={images.home.sectors} alt="" fill sizes="100vw" quality={60} className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/80" />
        <div className="container-site">
          <SectionHeading id="sectors-title" tone="dark" eyebrow={t("sectors.eyebrow")} title={t("sectors.title")} lead={t("sectors.lead")} />
          <ul className="reveal mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {site.sectors.map((sector) => (
              <li key={sector.key} className="group flex items-center gap-4 bg-black/75 p-6 transition-colors hover:bg-black/55">
                <Icon name={sector.icon} className="size-6 text-gold-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-paper">{sector[locale]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MÉTHODE */}
      <Section tone="light" labelledBy="method-title">
        <SectionHeading id="method-title" eyebrow={t("method.eyebrow")} title={t("method.title")} lead={t("method.lead")} />
        <ol className="reveal relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute top-5 right-[12%] left-[12%] hidden h-px bg-gold-500/50 md:block" />
          {site.method.map((step, index) => (
            <li key={step.en.title} className="relative">
              <span className="relative z-10 flex size-10 rotate-45 items-center justify-center border border-gold-500 bg-surface">
                <span className="-rotate-45 font-serif text-accent">{index + 1}</span>
              </span>
              <h3 className="mt-6 text-xl">{step[locale].title}</h3>
              <p className="mt-2 text-fg-muted">{step[locale].text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* PARTENAIRES — défilement horizontal */}
      <PartnersMarquee />

      {/* RÉALISATIONS — études de cas illustrées */}
      <Section tone="light" labelledBy="references-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="references-title" eyebrow={t("references.eyebrow")} title={t("references.title")} lead={t("references.lead")} />
          <ButtonLink href="/etudes-de-cas" variant="outline-dark" className="shrink-0">
            {t("references.cta")}
          </ButtonLink>
        </div>
        <ul className="reveal mt-12 grid gap-6 md:grid-cols-3">
          {caseStudies.map((study) => (
            <li key={study.key}>
              <Link
                href={{ pathname: "/etudes-de-cas/[slug]", params: { slug: study[locale].slug } }}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-fg/10 bg-surface-raised transition-[border-color,box-shadow] hover:border-gold-500/60 hover:shadow-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={study.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={65}
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
                  />
                  {study.isExample && (
                    <span className="absolute top-3 left-3 rounded-xs bg-black/75 px-2 py-0.5 text-xs text-gold-300">{tCommon("exampleBadge")}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg leading-snug group-hover:text-accent">{study[locale].title}</h3>
                  <p className="mt-2 flex-1 text-sm text-fg-muted">{study[locale].summary}</p>
                  <p className="mt-5 font-serif text-3xl text-accent">{study[locale].results[0].value}</p>
                  <p className="text-sm text-fg-muted">{study[locale].results[0].label}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ACADÉMIE */}
      <section aria-labelledby="academy-title" className="bg-ink-950 text-paper">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-72 lg:min-h-full">
            <Image src={images.home.academy} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={65} className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent lg:bg-linear-to-l" />
          </div>
          <div className="px-4 py-16 sm:px-10 lg:px-16 lg:py-24">
            <SectionHeading id="academy-title" tone="dark" eyebrow={t("academy.eyebrow")} title={t("academy.title")} lead={t("academy.lead")} />
            <ol className="reveal mt-8 space-y-3">
              {academy.courses.map((course, index) => (
                <li key={course.key} className="flex items-center gap-4 rounded-lg border border-ink-800 bg-ink-900 p-4">
                  <span className="font-serif text-2xl text-gold-500 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1">
                    <span className="block text-paper">{course[locale].title}</span>
                    <span className="text-sm text-slate-300">
                      {tAcademy(`levels.${course.level}`)} · {tAcademy("hours", { hours: course.hours })}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <ButtonLink href="/academie" size="lg" className="mt-8">
              {t("academy.cta")}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <Section tone="alt" labelledBy="testimonials-title">
        <SectionHeading id="testimonials-title" eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} align="center" className="mx-auto" />
        <ul className="reveal mt-12 grid gap-6 md:grid-cols-3">
          {site.testimonials.map((item) => (
            <li key={item.en.quote}>
              <figure className="flex h-full flex-col rounded-lg border border-fg/10 bg-surface-raised p-7 shadow-card">
                <Quote aria-hidden className="size-7 text-gold-500" strokeWidth={1.5} />
                <blockquote className="mt-4 flex-1 font-serif text-lg leading-relaxed">{item[locale].quote}</blockquote>
                <figcaption className="mt-6 border-t border-fg/10 pt-4 text-sm">
                  <span className="block font-medium">{item[locale].author}</span>
                  <span className="text-fg-muted">{item[locale].company}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      {/* APPEL À L'ACTION — sur fond photo */}
      <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-ink-950 text-paper">
        <Image src={images.home.cta} alt="" fill sizes="100vw" quality={60} className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/75 to-black/50" />
        <div className="container-site py-20 sm:py-28">
          <h2 id="cta-title" className="max-w-2xl text-3xl leading-tight sm:text-5xl">
            {t("cta.title")}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/85">{t("cta.lead")}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/devis" size="lg">
              {tNav("quote")}
              <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
            </ButtonLink>
            <ButtonLink href="/rendez-vous" size="lg" variant="outline" className="border-white/60 text-white hover:border-gold-400 hover:text-gold-300">
              {tNav("appointment")}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
