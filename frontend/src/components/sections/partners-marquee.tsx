import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Marquee } from "@/components/magicui/marquee";
import { Section, SectionHeading } from "@/components/ui/section";
import { getPartners } from "@/lib/content";

/**
 * « Ils nous font confiance » : défilement horizontal continu des partenaires.
 * Logo officiel s'il est fourni (content/partners.json → champ « logo »), sinon le nom.
 */
export async function PartnersMarquee() {
  const [t, { partners }] = await Promise.all([getTranslations("Home"), getPartners()]);

  return (
    <Section tone="alt" labelledBy="partners-title" className="!py-16 sm:!py-20">
      <SectionHeading
        id="partners-title"
        eyebrow={t("partners.eyebrow")}
        title={t("partners.title")}
        align="center"
        className="mx-auto"
      />
      <Marquee className="mt-12 [--duration:60s] [--gap:1.25rem]">
        {partners.map((partner) => (
          // Tuile blanche dans les deux thèmes : les logos officiels sont conçus pour un fond clair.
          <span
            key={partner.key}
            className="flex h-24 w-52 shrink-0 items-center justify-center rounded-md border border-black/5 bg-white px-6 shadow-card transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10"
          >
            {partner.logo ? (
              // Chargement immédiat mais en basse priorité : en chargement différé, les logos
              // masqués par le défilement horizontal apparaîtraient vides en entrant à l'écran.
              <Image
                src={partner.logo}
                alt={partner.name}
                width={240}
                height={128}
                sizes="160px"
                loading="eager"
                fetchPriority="low"
                className="h-14 w-auto max-w-40 object-contain"
              />
            ) : (
              <span className="text-center font-sans text-sm leading-snug font-semibold tracking-wide text-balance text-neutral-800 uppercase">
                {partner.name}
              </span>
            )}
          </span>
        ))}
      </Marquee>
    </Section>
  );
}
