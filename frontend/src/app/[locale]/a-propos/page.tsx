import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";

import { CtaBand } from "@/components/ui/cta-band";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import type { NativeLocale } from "@/i18n/config";
import { getAbout, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, about] = await Promise.all([getTranslations("About"), getAbout()]);
  return pageMetadata({ locale, href: "/a-propos", title: t("title"), description: about[locale].lead });
}

export default async function AboutPage() {
  const locale = (await rootLocale()) as NativeLocale;
  const [t, tHome, about, team] = await Promise.all([
    getTranslations("About"),
    getTranslations("Home"),
    getAbout(),
    getTeam(),
  ]);
  const content = about[locale];

  return (
    <>
      <PageHeader title={t("title")} lead={content.lead} />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-700 uppercase">{t("mission")}</h2>
            <p className="mt-4 font-serif text-3xl leading-snug">{content.mission}</p>
          </div>
          <div className="reveal">
            <h2 className="text-2xl">{t("story")}</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-950/85">
              {content.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="dark" labelledBy="values-title">
        <SectionHeading id="values-title" tone="dark" title={t("values")} />
        <ul className="reveal mt-12 grid gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 sm:grid-cols-2 lg:grid-cols-4">
          {content.values.map((value) => (
            <li key={value.title} className="bg-ink-950 p-7">
              <span aria-hidden className="block size-3 rotate-45 border border-gold-500" />
              <h3 className="mt-5 text-xl text-paper">{value.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{value.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="light" labelledBy="team-title">
        <SectionHeading id="team-title" title={t("team")} lead={t("teamLead")} />
        <p className="mt-6 flex max-w-3xl items-start gap-3 text-sm text-slate-600">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" strokeWidth={1.5} />
          {t("teamNotice")}
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.members.map((member) => (
            <li key={member.key} className="reveal rounded-lg border border-ink-950/10 bg-white p-6">
              {/* Monogramme dans un losange, en attendant les photos (CLAUDE.md §13). */}
              <span aria-hidden className="flex size-14 rotate-45 items-center justify-center border border-gold-600 bg-ink-950">
                <span className="-rotate-45 font-serif text-lg text-gold-400">{member.initials}</span>
              </span>
              <h3 className="mt-6 text-lg">{member[locale].name}</h3>
              <p className="text-sm text-gold-700">{member[locale].role}</p>
              <p className="mt-3 text-sm text-slate-600">{member[locale].bio}</p>
              {member.certifications.length > 0 && (
                <div className="mt-4">
                  <p className="sr-only">{t("certifications")}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {member.certifications.map((certification) => (
                      <li key={certification} className="rounded-xs bg-paper px-2 py-0.5 text-xs text-slate-600">
                        {certification}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title={tHome("cta.title")} text={tHome("cta.lead")} />
    </>
  );
}
