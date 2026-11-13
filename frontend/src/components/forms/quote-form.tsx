"use client";

import { Check, FileText, Paperclip, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { EMAIL_RE, PHONE_RE, postForm } from "@/lib/api";
import { cn } from "@/lib/utils";

import { ConsentCheckbox, Field, FormAlert, FormSuccess, Honeypot, Select, SubmitButton, TextArea, TextInput } from "./fields";
import { type Errors, hasErrors, useApiErrors, useForm } from "./use-form";

export interface Option {
  value: string;
  label: string;
}

const STEPS = ["service", "site", "need", "contact"] as const;
const STEP_FIELDS: Record<(typeof STEPS)[number], string[]> = {
  service: ["service"],
  site: ["sector", "site_size", "country"],
  need: ["description", "attachments"],
  contact: ["full_name", "email", "phone", "company", "consent"],
};
const SIZES = ["small", "medium", "large", "multi"] as const;

// Mêmes règles que le serveur (apps/leads/validators.py) : contrôle anticipé, le serveur reste juge.
const MAX_FILES = 3;
const MAX_MB = 5;
const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx"];

/** Demande de devis en 4 étapes (CLAUDE.md §7). */
export function QuoteForm({ services, sectors }: { services: Option[]; sectors: Option[] }) {
  const t = useTranslations("Quote");
  const tForm = useTranslations("Form");
  const locale = useLocale();
  const toErrors = useApiErrors();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [reference, setReference] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const { values, set, errors, setErrors, pending, setPending } = useForm({
    service: "",
    sector: "",
    site_size: "",
    country: "",
    description: "",
    full_name: "",
    email: "",
    phone: "",
    company: "",
    consent: false,
    website: "",
  });

  const serviceOptions = [...services, { value: "other", label: t("serviceOther") }];
  const sectorOptions = [...sectors, { value: "other", label: t("sectorOther") }];

  // Déplace le focus sur le titre de l'étape à chaque changement (lecteurs d'écran, clavier).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function validateStep(index: number): Errors {
    const required = tForm("errors.required");
    switch (STEPS[index]) {
      case "service":
        return { service: values.service ? undefined : required };
      case "site":
        return {
          sector: values.sector ? undefined : required,
          site_size: values.site_size ? undefined : required,
        };
      case "need":
        return { description: values.description.trim().length >= 10 ? undefined : required };
      default:
        return {
          full_name: values.full_name.trim() ? undefined : required,
          email: EMAIL_RE.test(values.email.trim()) ? undefined : tForm("errors.email"),
          phone: !values.phone || PHONE_RE.test(values.phone) ? undefined : tForm("errors.phone"),
          consent: values.consent ? undefined : tForm("errors.consent"),
        };
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    let error: string | undefined;
    for (const file of Array.from(list)) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (next.length >= MAX_FILES) error = tForm("errors.tooManyFiles", { max: MAX_FILES });
      else if (!ALLOWED_EXTENSIONS.includes(extension)) error = tForm("errors.fileType", { name: file.name });
      else if (file.size > MAX_MB * 1024 * 1024) error = tForm("errors.fileTooLarge", { name: file.name, mb: MAX_MB });
      else next.push(file);
    }
    setFiles(next);
    setErrors((current) => ({ ...current, attachments: error }));
  }

  function next() {
    const found = validateStep(step);
    setErrors(found);
    if (!hasErrors(found)) setStep((s) => s + 1);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < STEPS.length - 1) return next();
    const found = validateStep(step);
    setErrors(found);
    if (hasErrors(found)) return;

    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.append(key, String(value));
    data.append("locale", locale);
    for (const file of files) data.append("attachments", file);

    setPending(true);
    const result = await postForm<{ reference: string }>("quotes", data, locale);
    setPending(false);
    if (result.ok) return setReference(result.data.reference);

    const apiErrors = toErrors(result);
    setErrors(apiErrors);
    // Revient à la première étape qui contient une erreur signalée par le serveur.
    const stepWithError = STEPS.findIndex((s) => STEP_FIELDS[s].some((field) => apiErrors[field]));
    if (stepWithError >= 0) setStep(stepWithError);
  }

  if (reference) {
    return (
      <FormSuccess title={t("successTitle")} text={t("successText", { reference })}>
        <button type="button" className={buttonStyles("outline-dark", "md", "mt-6")} onClick={() => window.location.reload()}>
          {t("newRequest")}
        </button>
      </FormSuccess>
    );
  }

  const current = STEPS[step];

  return (
    <form noValidate onSubmit={onSubmit} className="relative">
      <Honeypot value={values.website} onChange={set("website")} />

      {/* Progression */}
      <p className="text-sm text-slate-600">{t("progress", { current: step + 1, total: STEPS.length })}</p>
      <ol className="mt-3 grid grid-cols-4 gap-2">
        {STEPS.map((name, index) => (
          <li key={name} aria-current={index === step ? "step" : undefined}>
            <span className={cn("block h-1 rounded-full", index <= step ? "bg-gold-600" : "bg-ink-950/10")} />
            <span className={cn("mt-2 hidden text-xs sm:block", index === step ? "font-medium text-ink-950" : "text-slate-600")}>
              {index < step && <Check aria-hidden className="mr-1 inline size-3 text-success" />}
              {t(`steps.${name}`)}
            </span>
          </li>
        ))}
      </ol>

      <fieldset className="mt-8 space-y-6">
        <legend className="sr-only">{t(`steps.${current}`)}</legend>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
          {t(`steps.${current}`)}
        </h2>

        {current === "service" && (
          <div>
            <p id="quote-service-label" className="mb-3 text-sm font-medium">
              {t("serviceLabel")} <span aria-hidden className="text-gold-600">*</span>
            </p>
            <div role="radiogroup" aria-labelledby="quote-service-label" aria-describedby={errors.service ? "quote-service-error" : undefined} className="grid gap-2 sm:grid-cols-2">
              {serviceOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors",
                    values.service === option.value ? "border-gold-600 bg-gold-500/10" : "border-ink-950/15 bg-white hover:border-gold-600/50",
                  )}
                >
                  <input
                    type="radio"
                    name="service"
                    value={option.value}
                    checked={values.service === option.value}
                    onChange={() => set("service")(option.value)}
                    className="accent-gold-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.service && (
              <p id="quote-service-error" className="mt-2 text-sm text-danger">
                {errors.service}
              </p>
            )}
          </div>
        )}

        {current === "site" && (
          <>
            <Field id="quote-sector" label={t("sectorLabel")} required error={errors.sector}>
              <Select id="quote-sector" options={sectorOptions} placeholder="—" value={values.sector} onChange={(e) => set("sector")(e.target.value)} error={errors.sector} />
            </Field>
            <Field id="quote-size" label={t("siteSizeLabel")} required error={errors.site_size}>
              <Select
                id="quote-size"
                options={SIZES.map((size) => ({ value: size, label: t(`sizes.${size}`) }))}
                placeholder="—"
                value={values.site_size}
                onChange={(e) => set("site_size")(e.target.value)}
                error={errors.site_size}
              />
            </Field>
            <Field id="quote-country" label={tForm("country")} optional error={errors.country}>
              <TextInput id="quote-country" autoComplete="country-name" value={values.country} onChange={(e) => set("country")(e.target.value)} error={errors.country} />
            </Field>
          </>
        )}

        {current === "need" && (
          <>
            <Field id="quote-description" label={t("descriptionLabel")} required hint={t("descriptionHelp")} error={errors.description}>
              <TextArea
                id="quote-description"
                rows={7}
                maxLength={5000}
                value={values.description}
                onChange={(e) => set("description")(e.target.value)}
                hint={t("descriptionHelp")}
                error={errors.description}
              />
            </Field>
            <Field id="quote-files" label={t("attachmentsLabel")} optional hint={t("attachmentsHelp")} error={errors.attachments}>
              <label
                htmlFor="quote-files"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-ink-950/25 bg-white px-4 py-6 text-sm text-slate-600 transition-colors hover:border-gold-600"
              >
                <Paperclip aria-hidden className="size-4 text-gold-700" strokeWidth={1.5} />
                {t("attachmentsLabel")}
              </label>
              <input
                id="quote-files"
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(",")}
                className="sr-only"
                aria-describedby={errors.attachments ? "quote-files-error" : "quote-files-hint"}
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </Field>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.name + file.size} className="flex items-center gap-3 rounded-sm border border-ink-950/10 bg-white px-3 py-2 text-sm">
                    <FileText aria-hidden className="size-4 shrink-0 text-gold-700" strokeWidth={1.5} />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-slate-600">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((f) => f !== file))}
                      className="rounded-sm p-1 text-slate-600 hover:bg-ink-950/5 hover:text-danger"
                    >
                      <X aria-hidden className="size-4" />
                      <span className="sr-only">{t("removeFile", { name: file.name })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {current === "contact" && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="quote-name" label={tForm("fullName")} required error={errors.full_name}>
                <TextInput id="quote-name" autoComplete="name" value={values.full_name} onChange={(e) => set("full_name")(e.target.value)} error={errors.full_name} />
              </Field>
              <Field id="quote-email" label={tForm("email")} required error={errors.email}>
                <TextInput id="quote-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} />
              </Field>
              <Field id="quote-phone" label={tForm("phone")} optional error={errors.phone}>
                <TextInput id="quote-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone} />
              </Field>
              <Field id="quote-company" label={tForm("company")} optional error={errors.company}>
                <TextInput id="quote-company" autoComplete="organization" value={values.company} onChange={(e) => set("company")(e.target.value)} error={errors.company} />
              </Field>
            </div>
            <ConsentCheckbox id="quote-consent" checked={values.consent} onChange={set("consent")} error={errors.consent} />
          </>
        )}
      </fieldset>

      <div className="mt-6">
        <FormAlert message={errors.form} />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={buttonStyles("outline-dark", "lg")}>
            {t("previous")}
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="submit" className={buttonStyles("primary", "lg")}>
            {t("next")}
          </button>
        ) : (
          <SubmitButton pending={pending} label={t("submit")} />
        )}
      </div>
    </form>
  );
}
