import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("News");
  return pageMetadata({ locale, href: "/actualites", title: t("title"), description: t("lead") });
}

export default async function NewsPage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tCommon, articles] = await Promise.all([
    getTranslations("News"),
    getTranslations("Common"),
    getArticles(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <Section tone="light">
        <ul className="grid gap-6 lg:grid-cols-3">
          {articles.map((article, index) => (
            <li key={article.key} className={cn("reveal", index === 0 && "lg:col-span-3")}>
              <Link
                href={{ pathname: "/actualites/[slug]", params: { slug: article[locale].slug } }}
                className={cn(
                  "group flex h-full flex-col rounded-lg border border-ink-950/10 bg-white p-7 transition-[border-color,box-shadow] hover:border-gold-600/50 hover:shadow-card",
                  index === 0 && "lg:flex-row lg:items-end lg:gap-12 lg:bg-ink-950 lg:p-10 lg:text-paper",
                )}
              >
                <div className="flex-1">
                  <p className={cn("text-sm text-slate-600", index === 0 && "lg:text-slate-300")}>
                    <time dateTime={article.date}>{formatDate(article.date, locale)}</time> ·{" "}
                    {t("readingTime", { minutes: article.readingMinutes })}
                  </p>
                  <h2 className={cn("mt-3 text-2xl leading-snug group-hover:text-gold-700", index === 0 && "lg:text-3xl lg:group-hover:text-gold-300")}>
                    {article[locale].title}
                  </h2>
                  <p className={cn("mt-3 text-slate-600", index === 0 && "lg:text-slate-300")}>{article[locale].excerpt}</p>
                </div>
                <span className={cn("mt-6 inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-700", index === 0 && "lg:text-gold-400")}>
                  {tCommon("readMore")}
                  <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
