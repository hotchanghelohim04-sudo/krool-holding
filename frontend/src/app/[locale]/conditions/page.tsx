import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";

import { LegalPageView } from "@/components/content/legal-page";
import type { NativeLocale } from "@/i18n/config";
import { getLegalPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const page = await getLegalPage("terms");
  return pageMetadata({ locale, href: "/conditions", title: page[locale].title });
}

export default async function TermsPage() {
  const locale = (await rootLocale()) as NativeLocale;
  return <LegalPageView page={await getLegalPage("terms")} locale={locale} />;
}
