import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Services");
  return pageMetadata({ locale, href: "/services", title: t("title"), description: t("lead") });
}

export default async function ServicesPage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, services] = await Promise.all([
    getTranslations("Services"),
    getTranslations("Common"),
    getServices(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.key} className="reveal">
              <Link
                href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }}
                className="group flex h-full flex-col rounded-lg border border-ink-950/10 bg-white p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-gold-600/50 hover:shadow-card"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-md bg-ink-950 text-gold-400">
                  <Icon name={service.icon} className="size-6" />
                </span>
                <h2 className="mt-6 text-2xl group-hover:text-gold-700">{service[locale].title}</h2>
                <p className="mt-3 flex-1 text-slate-600">{service[locale].summary}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-700">
                  {tCommon("learnMore")}
                  <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t("ctaTitle")} text={t("ctaText")} />
    </>
  );
}
