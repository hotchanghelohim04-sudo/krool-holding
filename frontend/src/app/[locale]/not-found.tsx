import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="section-y">
      <div className="container-site max-w-prose">
        <h1 className="text-4xl">{t("title")}</h1>
        <p className="mt-4 text-slate-600">{t("description")}</p>
        <Link
          href="/"
          className="mt-8 inline-block font-medium text-gold-700 underline underline-offset-4"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
