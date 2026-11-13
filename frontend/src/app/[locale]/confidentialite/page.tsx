import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";

import { LegalPageView } from "@/components/content/legal-page";
import type { NativeLocale } from "@/i18n/config";
import { getLegalPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const page = await getLegalPage("privacy");
  return pageMetadata({ locale, href: "/confidentialite", title: page[locale].title });
}

export default async function PrivacyPage() {
  const locale = (await rootLocale()) as NativeLocale;
  return <LegalPageView page={await getLegalPage("privacy")} locale={locale} />;
}
