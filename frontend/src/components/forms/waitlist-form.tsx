"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { EMAIL_RE, postJson } from "@/lib/api";
import { cn } from "@/lib/utils";

import { ConsentCheckbox, Field, FormAlert, FormSuccess, Honeypot, SubmitButton, TextInput } from "./fields";
import { type Errors, hasErrors, useApiErrors, useForm } from "./use-form";

const PROFILES = ["student", "professional", "company"] as const;

/** Inscription à la liste d'attente de Krool Academy (Phase 1 : « être prévenu du lancement »). */
export function WaitlistForm() {
  const t = useTranslations("Academy");
  const tForm = useTranslations("Form");
  const locale = useLocale();
  const toErrors = useApiErrors();
  const [done, setDone] = useState(false);
  const { values, set, errors, setErrors, pending, setPending } = useForm({
    email: "",
    full_name: "",
    profile: "professional" as (typeof PROFILES)[number],
    consent: false,
    website: "",
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found: Errors = {
      email: EMAIL_RE.test(values.email.trim()) ? undefined : tForm("errors.email"),
      consent: values.consent ? undefined : tForm("errors.consent"),
    };
    setErrors(found);
    if (hasErrors(found)) return;
    setPending(true);
    const result = await postJson("academy/waitlist", { ...values, locale }, locale);
    setPending(false);
    if (result.ok) setDone(true);
    else setErrors(toErrors(result));
  }

  if (done) return <FormSuccess tone="dark" title={t("successTitle")} text={t("success")} />;

  return (
    <form noValidate onSubmit={onSubmit} className="relative space-y-5">
      <Honeypot value={values.website} onChange={set("website")} />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-paper">{t("profileLabel")}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PROFILES.map((profile) => (
            <label
              key={profile}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors",
                values.profile === profile ? "border-gold-500 bg-gold-500/10 text-paper" : "border-ink-700 text-slate-300 hover:border-ink-700/80",
              )}
            >
              <input
                type="radio"
                name="profile"
                value={profile}
                checked={values.profile === profile}
                onChange={() => set("profile")(profile)}
                className="accent-gold-500"
              />
              {t(`profiles.${profile}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="waitlist-email" label={tForm("email")} required error={errors.email} tone="dark">
          <TextInput id="waitlist-email" type="email" autoComplete="email" tone="dark" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} />
        </Field>
        <Field id="waitlist-name" label={tForm("fullName")} optional tone="dark">
          <TextInput id="waitlist-name" autoComplete="name" tone="dark" value={values.full_name} onChange={(e) => set("full_name")(e.target.value)} />
        </Field>
      </div>
      <ConsentCheckbox id="waitlist-consent" tone="dark" checked={values.consent} onChange={set("consent")} error={errors.consent} />
      <FormAlert tone="dark" message={errors.form} />
      <SubmitButton pending={pending} label={t("submit")} />
    </form>
  );
}
