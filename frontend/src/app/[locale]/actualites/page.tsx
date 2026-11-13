import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { locale as rootLocale } from "next/root-params";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getArticles, getImages } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("News");
  return pageMetadata({ locale, href: "/actualites", title: t("title"), description: t("lead") });
}

export default async function NewsPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, articles] = await Promise.all([
    getTranslations("News"),
    getTranslations("Common"),
    getArticles(),
  ]);

  return (
    <>
      <PageHeader image={images.headers.news} title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <ul className="grid gap-6 lg:grid-cols-3">
          {articles.map((article, index) => (
            <li key={article.key} className={cn("reveal", index === 0 && "lg:col-span-3")}>
              <Link
                href={{ pathname: "/actualites/[slug]", params: { slug: article[locale].slug } }}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-lg border border-fg/10 bg-surface-raised transition-[border-color,box-shadow] hover:border-gold-500/60 hover:shadow-card",
                  index === 0 && "lg:flex-row",
                )}
              >
                <div className={cn("relative aspect-[16/10] overflow-hidden", index === 0 && "lg:aspect-auto lg:w-1/2")}>
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
                    quality={65}
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
                  />
                </div>
                <div className={cn("flex flex-1 flex-col p-7", index === 0 && "lg:justify-center lg:p-12")}>
                  <p className="text-sm text-fg-muted">
                    <time dateTime={article.date}>{formatDate(article.date, locale)}</time> ·{" "}
                    {t("readingTime", { minutes: article.readingMinutes })}
                  </p>
                  <h2 className={cn("mt-3 text-2xl leading-snug group-hover:text-accent", index === 0 && "lg:text-3xl")}>
                    {article[locale].title}
                  </h2>
                  <p className="mt-3 flex-1 text-fg-muted">{article[locale].excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    {tCommon("readMore")}
                    <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
