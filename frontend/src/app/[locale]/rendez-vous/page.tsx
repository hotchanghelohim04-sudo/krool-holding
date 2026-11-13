import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { AppointmentBooking } from "@/components/forms/appointment-booking";
import { ClientMessages } from "@/components/i18n/client-messages";
import { PageHeader } from "@/components/ui/page-header";
import type { NativeLocale } from "@/i18n/config";
import { getImages, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const t = await getTranslations("Appointment");
  return pageMetadata({ locale, href: "/rendez-vous", title: t("title"), description: t("lead") });
}

export default async function AppointmentPage() {
  const images = await getImages();
  const locale = (await rootLocale()) as NativeLocale;
  const [t, services] = await Promise.all([getTranslations("Appointment"), getServices()]);

  return (
    <>
      <PageHeader image={images.headers.appointment} title={t("title")} lead={t("lead")} />
      <div className="bg-surface">
        <div className="container-site py-14 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-lg border border-fg/10 bg-surface-raised p-6 shadow-card sm:p-10">
            <ClientMessages namespaces={["Form", "Appointment"]}>
              <AppointmentBooking topics={services.map((s) => ({ value: s.key, label: s[locale].title }))} />
            </ClientMessages>
          </div>
        </div>
      </div>
    </>
  );
}
