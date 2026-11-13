import type { Icon } from "@phosphor-icons/react";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import type { SiteContent, SocialNetwork } from "@/lib/content";
import { cn } from "@/lib/utils";

// Phosphor Icons (autorisé par CLAUDE.md, règle 10) : logos de marques en trait fin.
const ICONS: Record<SocialNetwork, Icon> = {
  linkedin: LinkedinLogo,
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  youtube: YoutubeLogo,
  x: XLogo,
  tiktok: TiktokLogo,
  whatsapp: WhatsappLogo,
};

const base =
  "inline-flex size-10 items-center justify-center rounded-full border border-ink-800 text-slate-300 transition-colors";

/**
 * Réseaux sociaux du cabinet. Tant qu'une URL est vide (comptes pas encore créés),
 * l'icône est affichée atténuée, sans lien, avec la mention « bientôt disponible ».
 */
export async function SocialLinks({ social }: { social: SiteContent["social"] }) {
  const t = await getTranslations("Footer");

  return (
    <ul className="flex flex-wrap gap-2">
      {social.map(({ network, url }) => {
        const Icon = ICONS[network];
        const name = t(`networks.${network}`);
        return (
          <li key={network}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={cn(base, "hover:border-gold-500 hover:text-gold-400")}
              >
                <Icon aria-hidden size={20} weight="light" />
              </a>
            ) : (
              <span role="img" aria-label={t("socialSoon", { network: name })} title={t("socialSoon", { network: name })} className={cn(base, "opacity-60")}>
                <Icon aria-hidden size={20} weight="light" />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
