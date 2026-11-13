import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();
  const t = await getTranslations("Metadata");

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    // hreflang : chaque langue native pointe vers ses équivalents.
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  // Langue non prise en charge (ex. /xx/…, /favicon.ico) : 404 plutôt qu'un rendu par défaut.
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* Seuls les messages utiles aux composants client sont envoyés au navigateur. */}
        <NextIntlClientProvider messages={{ LocaleSwitcher: messages.LocaleSwitcher }}>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
