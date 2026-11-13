import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import type { NativeLocale } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { getSite } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/**
 * Traductions des composants client présents sur toutes les pages (en-tête, pied de page).
 * Les formulaires propres à une page reçoivent les leurs via <ClientMessages>.
 */
const CLIENT_NAMESPACES = ["LocaleSwitcher", "Nav", "Form", "Newsletter"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Metadata");

  // pageMetadata d'abord : les clés suivantes (titre et son modèle) ne doivent pas être écrasées.
  return {
    ...pageMetadata({ locale, href: "/", description: t("description") }),
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    applicationName: t("siteName"),
    openGraph: {
      ...pageMetadata({ locale, href: "/" }).openGraph,
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  // Langue non prise en charge (ex. /xx/…, /favicon.ico) : 404 plutôt qu'un rendu par défaut.
  if (!hasLocale(routing.locales, locale)) notFound();
  const [messages, site, t] = await Promise.all([getMessages(), getSite(), getTranslations("Metadata")]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("siteName"),
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl("/brand/icon-512.png"),
    description: t("description"),
    email: site.contact.emails.contact,
    address: { "@type": "PostalAddress", addressLocality: "Douala", addressCountry: "CM" },
    areaServed: ["CM", "GA", "CG", "TD", "CF", "GQ"],
  };

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={organization} />
        <NextIntlClientProvider messages={clientMessages}>
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
