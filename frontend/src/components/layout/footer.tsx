import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

// Avec cacheComponents, la date courante doit être lue dans une portée mise en cache.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const t = await getTranslations("Footer");
  const year = await currentYear();

  return (
    <footer className="border-t border-ink-800 bg-ink-950 py-8 text-sm text-slate-300">
      <div className="container-site flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>{t("rights", { year })}</p>
        <p>{t("location")}</p>
      </div>
    </footer>
  );
}
