import { Mail, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import Image from "next/image";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getServices, getSite } from "@/lib/content";

// Avec cacheComponents, la date courante doit être lue dans une portée mise en cache.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const linkClass = "text-slate-300 transition-colors hover:text-gold-300";

export async function Footer() {
  const locale = (await getLocale()) as NativeLocale;
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tNews = await getTranslations("Newsletter");
  const [services, site, year] = await Promise.all([getServices(), getSite(), currentYear()]);

  const firmLinks = [
    { key: "about", pathname: "/a-propos" },
    { key: "references", pathname: "/references" },
    { key: "caseStudies", pathname: "/etudes-de-cas" },
    { key: "academy", pathname: "/academie" },
    { key: "news", pathname: "/actualites" },
    { key: "faq", pathname: "/faq" },
  ] as const;

  return (
    <footer className="bg-ink-950 text-paper">
      {/* Lettre d'information */}
      <div className="border-y border-ink-800">
        <div className="container-site grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl">{tNews("title")}</h2>
            <p className="mt-2 max-w-md text-slate-300">{tNews("lead")}</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src="/brand/logo-compact-on-dark.svg" alt="" width={112} height={108} unoptimized className="h-24 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-300">{t("tagline")}</p>
        </div>

        <nav aria-labelledby="footer-services" className="lg:col-span-3">
          <h2 id="footer-services" className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">
            {t("servicesTitle")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((service) => (
              <li key={service.key}>
                <Link href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }} className={linkClass}>
                  {service[locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-firm" className="lg:col-span-2">
          <h2 id="footer-firm" className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">
            {t("firmTitle")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {firmLinks.map((item) => (
              <li key={item.key}>
                <Link href={item.pathname} className={linkClass}>
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">{t("contactTitle")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2.5">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={1.5} />
              {site.contact.address[locale]}
            </li>
            <li className="flex gap-2.5">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={1.5} />
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className={linkClass}>
                {site.contact.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={1.5} />
              <a href={`mailto:${site.contact.emails.contact}`} className={linkClass}>
                {site.contact.emails.contact}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <Link href="/devis" className="font-medium text-gold-400 hover:text-gold-300">
              {tNav("quote")} →
            </Link>
            <Link href="/rendez-vous" className="font-medium text-gold-400 hover:text-gold-300">
              {tNav("appointment")} →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
          <p>{t("rights", { year })}</p>
          <nav aria-label={t("legalNav")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <Link href="/mentions-legales" className={linkClass}>{t("legalNotice")}</Link>
              </li>
              <li>
                <Link href="/confidentialite" className={linkClass}>{t("privacy")}</Link>
              </li>
              <li>
                <Link href="/conditions" className={linkClass}>{t("terms")}</Link>
              </li>
            </ul>
          </nav>
          <p>{t("location")}</p>
        </div>
      </div>
    </footer>
  );
}
