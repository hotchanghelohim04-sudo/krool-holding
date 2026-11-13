import { Info } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import type { LegalPage } from "@/lib/content";
import { formatDate } from "@/lib/format";

import { Blocks } from "./blocks";

/** Gabarit commun des pages légales (mentions, confidentialité, CGU/CGV). */
export async function LegalPageView({ page, locale }: { page: LegalPage; locale: NativeLocale }) {
  const t = await getTranslations("Common");
  return (
    <>
      <PageHeader title={page[locale].title}>
        <p className="mt-4 text-sm text-slate-300">{t("updatedOn", { date: formatDate(page.updated, locale) })}</p>
      </PageHeader>
      <div className="bg-surface">
        <div className="container-site py-14 sm:py-20">
          <div className="mx-auto max-w-prose">
            <p className="mb-8 flex items-start gap-3 rounded-sm border border-fg/10 bg-surface-raised px-4 py-3 text-sm text-fg-muted">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} />
              {t("placeholderNotice")}
            </p>
            <Blocks blocks={page[locale].body} />
          </div>
        </div>
      </div>
    </>
  );
}
