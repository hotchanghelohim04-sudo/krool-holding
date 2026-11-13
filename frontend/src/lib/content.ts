/**
 * Lecture des contenus éditoriaux du dossier `content/` (racine du dépôt).
 *
 * Les fichiers sont lus côté serveur et mis en cache (`use cache`) : les pages
 * restent pré-rendues en statique. Les types ci-dessous décrivent la forme
 * attendue des fichiers JSON (voir content/README.md).
 */
import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";

import type { NativeLocale } from "@/i18n/config";

const CONTENT_DIR = process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "..", "content");

export type Localized<T> = Record<NativeLocale, T>;

export type Block =
  | { type: "p" | "h2"; text: string }
  | { type: "ul"; items: string[] };

export type IconName = string;

export interface ServiceContent {
  slug: string;
  title: string;
  short: string;
  summary: string;
  intro: string;
  deliverables: string[];
  approach: { title: string; text: string }[];
  standards: string[];
}

export type Service = { key: string; icon: IconName; order: number; image: string } & Localized<ServiceContent>;

export interface CaseStudyContent {
  slug: string;
  title: string;
  client: string;
  summary: string;
  context: string;
  approach: string[];
  results: { value: string; label: string }[];
}

export type CaseStudy = {
  key: string;
  isExample: boolean;
  sector: string;
  service: string;
  year: number;
  image: string;
} & Localized<CaseStudyContent>;

export interface ArticleContent {
  slug: string;
  title: string;
  excerpt: string;
  body: Block[];
}

export type Article = {
  key: string;
  date: string;
  readingMinutes: number;
  service: string;
  image: string;
} & Localized<ArticleContent>;

export type LegalPage = { key: string; updated: string } & Localized<{
  title: string;
  body: Block[];
}>;

export interface SiteContent {
  contact: {
    phone: string;
    emails: Record<"contact" | "solutions" | "support" | "finance", string>;
    address: Localized<string>;
    hours: Localized<string>;
  };
  stats: ({ value: number; suffix: string } & Localized<string>)[];
  sectors: ({ key: string; icon: IconName } & Localized<string>)[];
  method: Localized<{ title: string; text: string }>[];
  testimonials: Localized<{ quote: string; author: string; company: string }>[];
  references: ({ sector: string } & Localized<string>)[];
  social: { network: SocialNetwork; url: string }[];
  credentials: ({ key: string; name: string; logo: string | null } & Localized<string>)[];
}

export type SocialNetwork = "linkedin" | "facebook" | "instagram" | "youtube" | "x" | "tiktok" | "whatsapp";

export interface ImagesContent {
  hero: string;
  headers: Record<
    "services" | "caseStudies" | "about" | "academy" | "references" | "news" | "quote" | "appointment" | "contact" | "faq",
    string
  >;
  home: Record<"firm" | "sectors" | "academy" | "cta", string>;
  about: Record<"team", string>;
}

export interface PartnersContent {
  partners: { key: string; name: string; logo: string | null }[];
}

export type AboutContent = Localized<{
  lead: string;
  mission: string;
  story: string[];
  values: { title: string; text: string }[];
}>;

export interface TeamContent {
  members: ({
    key: string;
    initials: string;
    certifications: string[];
  } & Localized<{ name: string; role: string; bio: string }>)[];
}

export type FaqContent = Localized<{ q: string; a: string }[]>;

export interface AcademyContent {
  features: ({ icon: IconName } & Localized<{ title: string; text: string }>)[];
  courses: ({
    key: string;
    level: "beginner" | "intermediate" | "advanced";
    hours: number;
  } & Localized<{ title: string; summary: string }>)[];
}

async function readJson<T>(relativePath: string): Promise<T> {
  "use cache";
  cacheLife("max");
  const raw = await readFile(path.join(CONTENT_DIR, relativePath), "utf8");
  return JSON.parse(raw) as T;
}

async function readCollection<T>(folder: string): Promise<T[]> {
  "use cache";
  cacheLife("max");
  const files = (await readdir(path.join(CONTENT_DIR, folder)))
    .filter((name) => name.endsWith(".json"))
    .sort();
  return Promise.all(files.map((name) => readJson<T>(`${folder}/${name}`)));
}

export async function getSite() {
  return readJson<SiteContent>("site.json");
}

export async function getAbout() {
  return readJson<AboutContent>("about.json");
}

export async function getTeam() {
  return readJson<TeamContent>("team.json");
}

export async function getFaq() {
  return readJson<FaqContent>("faq.json");
}

export async function getAcademy() {
  return readJson<AcademyContent>("academy.json");
}

export async function getImages() {
  return readJson<ImagesContent>("images.json");
}

export async function getPartners() {
  return readJson<PartnersContent>("partners.json");
}

export async function getServices() {
  const services = await readCollection<Service>("services");
  return services.sort((a, b) => a.order - b.order);
}

export async function getCaseStudies() {
  const items = await readCollection<CaseStudy>("case-studies");
  return items.sort((a, b) => b.year - a.year || a.key.localeCompare(b.key));
}

export async function getArticles() {
  const items = await readCollection<Article>("blog");
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLegalPage(key: "legal-notice" | "privacy" | "terms") {
  return readJson<LegalPage>(`legal/${key}.json`);
}

/** Retrouve une fiche par son slug, quelle que soit la langue du slug. */
export function findBySlug<T extends Localized<{ slug: string }>>(
  items: T[],
  slug: string,
): { item: T; slugLocale: NativeLocale } | undefined {
  for (const item of items) {
    if (item.fr.slug === slug) return { item, slugLocale: "fr" };
    if (item.en.slug === slug) return { item, slugLocale: "en" };
  }
  return undefined;
}
