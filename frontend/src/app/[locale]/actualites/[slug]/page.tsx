import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { Blocks } from "@/components/content/blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaBand } from "@/components/ui/cta-band";
import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import { getPathname, Link, permanentRedirect } from "@/i18n/navigation";
import { findBySlug, getArticles, getServices } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/metadata";

// Fiches pré-rendues pour chaque slug (generateStaticParams) ; la page lit son slug
// avant tout rendu pour pouvoir rediriger vers le slug de la bonne langue.
export const instant = false;

export async function generateStaticParams() {
  const locale = (await rootLocale()) as NativeLocale;
  return (await getArticles()).map((article) => ({ slug: article[locale].slug }));
}

async function resolve(slug: string) {
  const locale = (await rootLocale()) as NativeLocale;
  const found = findBySlug(await getArticles(), decodeURIComponent(slug));
  if (!found) notFound();
  if (found.slugLocale !== locale) {
    permanentRedirect({
      href: { pathname: "/actualites/[slug]", params: { slug: found.item[locale].slug } },
      locale,
    });
  }
  return { locale, article: found.item };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/actualites/[slug]">): Promise<Metadata> {
  const { locale, article } = await resolve((await params).slug);
  return pageMetadata({
    locale,
    type: "article",
    title: article[locale].title,
    description: article[locale].excerpt,
    hrefs: {
      fr: { pathname: "/actualites/[slug]", params: { slug: article.fr.slug } },
      en: { pathname: "/actualites/[slug]", params: { slug: article.en.slug } },
    },
  });
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/actualites/[slug]">) {
  const { locale, article } = await resolve((await params).slug);
  const content = article[locale];
  const [t, tHome, services] = await Promise.all([getTranslations("News"), getTranslations("Home"), getServices()]);
  const service = services.find((s) => s.key === article.service);
  const url = absoluteUrl(
    getPathname({ href: { pathname: "/actualites/[slug]", params: { slug: content.slug } }, locale }),
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: content.title,
          description: content.excerpt,
          datePublished: article.date,
          inLanguage: locale,
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: "Krool Holding" },
          publisher: {
            "@type": "Organization",
            name: "Krool Holding",
            logo: { "@type": "ImageObject", url: absoluteUrl("/brand/icon-512.png") },
          },
        }}
      />
      <PageHeader eyebrow={t("title")} title={content.title} lead={content.excerpt} image={article.image}>
        <p className="mt-6 text-sm text-slate-300">
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time> ·{" "}
          {t("readingTime", { minutes: article.readingMinutes })}
        </p>
      </PageHeader>
      <article className="bg-surface">
        <div className="container-site py-14 sm:py-20">
          <div className="mx-auto max-w-prose">
            <Blocks blocks={content.body} />
            {service && (
              <p className="mt-12 border-t border-fg/10 pt-6 text-sm text-fg-muted">
                {t("relatedService")} :{" "}
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: service[locale].slug } }}
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {service[locale].title}
                </Link>
              </p>
            )}
            <Link href="/actualites" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
              {t("back")}
            </Link>
          </div>
        </div>
      </article>
      <CtaBand title={tHome("cta.title")} text={tHome("cta.lead")} />
    </>
  );
}
