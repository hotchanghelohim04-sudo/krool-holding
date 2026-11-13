/** Date longue localisée (ex. « 6 octobre 2026 » / « October 6, 2026 »). */
export function formatDate(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Africa/Douala" }).format(
    new Date(`${isoDate}T12:00:00Z`),
  );
}
