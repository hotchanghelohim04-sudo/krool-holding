import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { ContactForm } from "@/components/forms/contact-form";
import { ClientMessages } from "@/components/i18n/client-messages";
import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import { getImages, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Contact");
  return pageMetadata({ locale, href: "/contact", title: t("title"), description: t("lead") });
}

export default async function ContactPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, site] = await Promise.all([getTranslations("Contact"), getSite()]);
  const { contact } = site;
  const emails = ["contact", "solutions", "support", "finance"] as const;

  return (
    <>
      <PageHeader image={images.headers.contact} title={t("title")} lead={t("lead")} />
      <div className="bg-surface">
        <div className="container-site grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-8">
            <div className="rounded-lg bg-ink-950 p-7 text-paper">
              <h2 className="text-xl">{t("coordinatesTitle")}</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {[
                  { icon: MapPin, label: t("address"), value: contact.address[locale] },
                  { icon: Phone, label: t("phone"), value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
                  { icon: Clock, label: t("hours"), value: contact.hours[locale] },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label}>
                    <dt className="flex items-center gap-3 text-slate-300">
                      <Icon aria-hidden className="size-4 shrink-0 text-gold-500" strokeWidth={1.5} />
                      {label}
                    </dt>
                    <dd className="mt-0.5 pl-7 text-paper">
                      {href ? (
                        <a href={href} className="hover:text-gold-300">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="text-xl">{t("emailsTitle")}</h2>
              <ul className="mt-4 divide-y divide-fg/10 rounded-lg border border-fg/10 bg-surface-raised">
                {emails.map((key) => (
                  <li key={key} className="flex gap-3 p-4">
                    <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="text-sm text-fg-muted">{t(`emails.${key}`)}</p>
                      <a href={`mailto:${contact.emails[key]}`} className="font-medium break-all text-fg hover:text-accent">
                        {contact.emails[key]}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <section aria-labelledby="contact-form-title" className="rounded-lg border border-fg/10 bg-surface-raised p-6 shadow-card sm:p-10">
            <h2 id="contact-form-title" className="mb-6 text-2xl">
              {t("formTitle")}
            </h2>
            <ClientMessages namespaces={["Form", "Contact"]}>
              <ContactForm />
            </ClientMessages>
          </section>
        </div>
      </div>
    </>
  );
}
