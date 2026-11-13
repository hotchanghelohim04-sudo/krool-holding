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
          <span
            key={partner.key}
            className="flex h-20 min-w-48 items-center justify-center rounded-md border border-fg/10 bg-surface-raised px-6 grayscale transition-[filter] duration-300 hover:grayscale-0"
          >
            {partner.logo ? (
              <Image src={partner.logo} alt={partner.name} width={160} height={56} className="h-12 w-auto object-contain" />
            ) : (
              <span className="text-center font-sans text-base font-semibold tracking-wide whitespace-nowrap text-fg/80 uppercase">
                {partner.name}
              </span>
            )}
          </span>
        ))}
      </Marquee>
    </Section>
  );
}
