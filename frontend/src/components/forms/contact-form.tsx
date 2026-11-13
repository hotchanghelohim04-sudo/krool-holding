"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { EMAIL_RE, PHONE_RE, postJson } from "@/lib/api";
import { getCaptchaToken, preloadRecaptcha } from "@/lib/recaptcha";

import { ConsentCheckbox, Field, FormAlert, FormSuccess, Honeypot, RecaptchaNotice, SubmitButton, TextArea, TextInput } from "./fields";
import { type Errors, hasErrors, useApiErrors, useForm } from "./use-form";

export function ContactForm() {
  const t = useTranslations("Contact");
  const tForm = useTranslations("Form");
  const locale = useLocale();
  const toErrors = useApiErrors();
  const form = useForm({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    consent: false,
    website: "",
  });
  const { values, set, errors, setErrors, pending, setPending } = form;
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const required = tForm("errors.required");
    return {
      full_name: values.full_name.trim() ? undefined : required,
      email: EMAIL_RE.test(values.email.trim()) ? undefined : tForm("errors.email"),
      phone: !values.phone || PHONE_RE.test(values.phone) ? undefined : tForm("errors.phone"),
      subject: values.subject.trim() ? undefined : required,
      message: values.message.trim() ? undefined : required,
      consent: values.consent ? undefined : tForm("errors.consent"),
    };
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (hasErrors(found)) return;
    setPending(true);
    const captcha = await getCaptchaToken("contact");
    const result = await postJson("contact", { ...values, locale, captcha }, locale);
    setPending(false);
    if (result.ok) setDone(true);
    else setErrors(toErrors(result));
  }

  if (done) return <FormSuccess title={t("successTitle")} text={t("successText")} />;

  return (
    <form noValidate onSubmit={onSubmit} onFocusCapture={preloadRecaptcha} className="relative space-y-5">
      <p className="text-sm text-fg-muted">{tForm("requiredHint")}</p>
      <Honeypot value={values.website} onChange={set("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label={tForm("fullName")} required error={errors.full_name}>
          <TextInput id="contact-name" autoComplete="name" value={values.full_name} onChange={(e) => set("full_name")(e.target.value)} error={errors.full_name} />
        </Field>
        <Field id="contact-email" label={tForm("email")} required error={errors.email}>
          <TextInput id="contact-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} />
        </Field>
        <Field id="contact-phone" label={tForm("phone")} optional error={errors.phone}>
          <TextInput id="contact-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone} />
        </Field>
        <Field id="contact-company" label={tForm("company")} optional error={errors.company}>
          <TextInput id="contact-company" autoComplete="organization" value={values.company} onChange={(e) => set("company")(e.target.value)} error={errors.company} />
        </Field>
      </div>
      <Field id="contact-subject" label={t("subject")} required error={errors.subject}>
        <TextInput id="contact-subject" maxLength={150} value={values.subject} onChange={(e) => set("subject")(e.target.value)} error={errors.subject} />
      </Field>
      <Field id="contact-message" label={t("message")} required error={errors.message}>
        <TextArea id="contact-message" maxLength={5000} rows={6} value={values.message} onChange={(e) => set("message")(e.target.value)} error={errors.message} />
      </Field>
      <ConsentCheckbox id="contact-consent" checked={values.consent} onChange={set("consent")} error={errors.consent} />
      <FormAlert message={errors.form} />
      <SubmitButton pending={pending} label={t("submit")} />
      <RecaptchaNotice />
    </form>
  );
}
