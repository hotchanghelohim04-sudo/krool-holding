"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { EMAIL_RE, postJson } from "@/lib/api";
import { getCaptchaToken, preloadRecaptcha } from "@/lib/recaptcha";

import { ConsentCheckbox, FormAlert, FormSuccess, Honeypot, RecaptchaNotice, SubmitButton, TextInput } from "./fields";

/** Inscription à la lettre d'information (double opt-in : e-mail de confirmation). */
export function NewsletterForm() {
  const t = useTranslations("Newsletter");
  const tForm = useTranslations("Form");
  const locale = useLocale();
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<{ email?: string; consent?: string; form?: string }>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = tForm("errors.email");
    if (!consent) next.consent = tForm("errors.consent");
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    const captcha = await getCaptchaToken("newsletter");
    const result = await postJson("newsletter/subscribe", { email, locale, consent, website, captcha }, locale);
    setPending(false);
    if (result.ok) return setDone(true);
    if (result.kind === "rateLimited") return setErrors({ form: tForm("errors.rateLimited") });
    if (result.kind === "network") return setErrors({ form: tForm("errors.network") });
    if (result.kind === "captcha") return setErrors({ form: tForm("errors.captcha") });
    setErrors({ form: tForm("errors.generic") });
  }

  if (done) return <FormSuccess tone="dark" title={t("successTitle")} text={t("success")} />;

  return (
    <form noValidate onSubmit={onSubmit} onFocusCapture={preloadRecaptcha} className="relative space-y-3">
      <Honeypot value={website} onChange={setWebsite} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            {t("emailLabel")}
          </label>
          <TextInput
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            tone="dark"
            placeholder={t("placeholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          {errors.email && (
            <p id={`${id}-email-error`} className="mt-1.5 text-sm text-red-300">
              {errors.email}
            </p>
          )}
        </div>
        <SubmitButton pending={pending} label={t("submit")} className="sm:h-[2.875rem]" />
      </div>
      <ConsentCheckbox id={`${id}-consent`} checked={consent} onChange={setConsent} error={errors.consent} tone="dark" />
      <FormAlert tone="dark" message={errors.form} />
      <RecaptchaNotice tone="dark" />
    </form>
  );
}
