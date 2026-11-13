import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getImages, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Services");
  return pageMetadata({ locale, href: "/services", title: t("title"), description: t("lead") });
}

export default async function ServicesPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, services] = await Promise.all([
    getTranslations("Services"),
    getTranslations("Common"),
    getServices(),
  ]);

  return (
    <>
      <PageHeader image={images.headers.services} title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.key} className="reveal">
              <Link
                href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-fg/10 bg-surface-raised transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-card"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    quality={65}
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 inline-flex size-11 items-center justify-center rounded-md bg-black/75 text-gold-400">
                    <Icon name={service.icon} className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h2 className="text-2xl group-hover:text-accent">{service[locale].title}</h2>
                  <p className="mt-3 flex-1 text-fg-muted">{service[locale].summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    {tCommon("learnMore")}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t("ctaTitle")} text={t("ctaText")} />
    </>
  );
}
