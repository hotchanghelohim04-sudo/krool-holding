import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { Suspense } from "react";

import { NewsletterConfirmation } from "@/components/forms/newsletter-confirmation";
import { ClientMessages } from "@/components/i18n/client-messages";
import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("NewsletterConfirm");
  // Page technique (lien reçu par e-mail) : jamais indexée.
  return pageMetadata({ locale, href: "/newsletter/confirmation", title: t("title"), noIndex: true });
}

export default async function NewsletterConfirmationPage() {
  const t = await getTranslations("NewsletterConfirm");
  return (
    <>
      <PageHeader title={t("title")} />
      <div className="bg-paper">
        <div className="container-site py-14 sm:py-20">
          <div className="max-w-2xl">
            {/* Le jeton est lu dans l'URL côté navigateur : le reste de la page reste statique. */}
            <Suspense fallback={<p className="text-lg text-slate-600">{t("confirming")}</p>}>
              <ClientMessages namespaces={["NewsletterConfirm"]}>
                <NewsletterConfirmation />
              </ClientMessages>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
