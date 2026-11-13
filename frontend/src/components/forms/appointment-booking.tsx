"use client";

import { CalendarDays, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { EMAIL_RE, getJson, PHONE_RE, postJson } from "@/lib/api";
import { getCaptchaToken, preloadRecaptcha } from "@/lib/recaptcha";
import { cn } from "@/lib/utils";

import { ConsentCheckbox, Field, FormAlert, FormSuccess, Honeypot, RecaptchaNotice, Select, SubmitButton, TextArea, TextInput } from "./fields";
import type { Option } from "./quote-form";
import { type Errors, hasErrors, useApiErrors, useForm } from "./use-form";

interface Slot {
  id: number;
  start: string;
  duration_minutes: number;
}

const TIME_ZONE = "Africa/Douala";
const MODES = ["video", "phone", "on-site"] as const;

/** Prise de rendez-vous : créneaux définis par l'administrateur, confirmation par e-mail. */
export function AppointmentBooking({ topics }: { topics: Option[] }) {
  const t = useTranslations("Appointment");
  const tForm = useTranslations("Form");
  const locale = useLocale();
  const toErrors = useApiErrors();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [day, setDay] = useState<string>();
  const [slotId, setSlotId] = useState<number>();
  const [confirmedAt, setConfirmedAt] = useState<string>();
  const { values, set, errors, setErrors, pending, setPending } = useForm({
    mode: "video" as (typeof MODES)[number],
    topic: topics[0]?.value ?? "consulting",
    full_name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    consent: false,
    website: "",
  });

  const dayKey = useMemo(
    () => new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }),
    [],
  );
  const dayLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, weekday: "short", day: "numeric", month: "short" }),
    [locale],
  );
  const timeLabel = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, timeStyle: "short" }), [locale]);
  const fullLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, dateStyle: "full", timeStyle: "short" }),
    [locale],
  );

  const load = useCallback(async () => {
    setLoadError(false);
    setSlots(null);
    const result = await getJson<Slot[]>("appointments/slots", locale);
    if (result.ok) setSlots(result.data);
    else setLoadError(true);
  }, [locale]);

  useEffect(() => {
    // Chargement initial des créneaux disponibles (données externes → état local).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Créneaux regroupés par jour (heure de Douala).
  const days = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const slot of slots ?? []) {
      const key = dayKey.format(new Date(slot.start));
      groups.set(key, [...(groups.get(key) ?? []), slot]);
    }
    return [...groups.entries()];
  }, [slots, dayKey]);

  const activeDay = day ?? days[0]?.[0];
  const activeSlots = days.find(([key]) => key === activeDay)?.[1] ?? [];
  const selected = slots?.find((slot) => slot.id === slotId);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const required = tForm("errors.required");
    const found: Errors = {
      slot: selected ? undefined : t("chooseSlot"),
      full_name: values.full_name.trim() ? undefined : required,
      email: EMAIL_RE.test(values.email.trim()) ? undefined : tForm("errors.email"),
      phone: !values.phone || PHONE_RE.test(values.phone) ? undefined : tForm("errors.phone"),
      consent: values.consent ? undefined : tForm("errors.consent"),
    };
    setErrors(found);
    if (hasErrors(found) || !selected) return;

    setPending(true);
    const captcha = await getCaptchaToken("appointment");
    const result = await postJson("appointments", { ...values, slot: selected.id, locale, captcha }, locale);
    setPending(false);
    if (result.ok) return setConfirmedAt(selected.start);
    if (result.kind === "conflict") {
      // Créneau pris entre-temps : on le retire et on invite à en choisir un autre.
      setSlots((current) => current?.filter((slot) => slot.id !== selected.id) ?? null);
      setSlotId(undefined);
      return setErrors({ slot: t("slotTaken"), form: t("slotTaken") });
    }
    setErrors(toErrors(result));
  }

  if (confirmedAt) {
    return <FormSuccess title={t("successTitle")} text={t("successText", { date: fullLabel.format(new Date(confirmedAt)) })} />;
  }

  return (
    <form noValidate onSubmit={onSubmit} onFocusCapture={preloadRecaptcha} className="relative space-y-10">
      <Honeypot value={values.website} onChange={set("website")} />

      <section aria-labelledby="slots-title">
        <h2 id="slots-title" className="text-2xl">
          {t("slotsTitle")}
        </h2>
        <p className="mt-1 text-sm text-fg-muted">{t("timezoneNote")}</p>

        {slots === null && !loadError && (
          <p role="status" className="mt-6 flex items-center gap-2 text-fg-muted">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            {t("loadingSlots")}
          </p>
        )}
        {loadError && (
          <div className="mt-6">
            <FormAlert message={t("slotsError")} />
            <button type="button" onClick={load} className={buttonStyles("outline-dark", "md", "mt-3")}>
              {t("retry")}
            </button>
          </div>
        )}
        {slots && slots.length === 0 && <p className="mt-6 rounded-sm border border-fg/10 bg-surface-raised p-4 text-fg-muted">{t("noSlots")}</p>}

        {days.length > 0 && (
          <>
            {/* Jours */}
            <div role="radiogroup" aria-label={t("slotsTitle")} className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {days.map(([key, daySlots]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={key === activeDay}
                  onClick={() => setDay(key)}
                  className={cn(
                    "shrink-0 rounded-sm border px-4 py-2.5 text-sm whitespace-nowrap capitalize transition-colors",
                    key === activeDay ? "border-gold-600 bg-ink-950 text-gold-300" : "border-fg/15 bg-surface-raised hover:border-gold-600/50",
                  )}
                >
                  {dayLabel.format(new Date(daySlots[0].start))}
                </button>
              ))}
            </div>
            {/* Heures du jour choisi */}
            <div
              role="radiogroup"
              aria-label={activeSlots[0] ? dayLabel.format(new Date(activeSlots[0].start)) : undefined}
              aria-describedby={errors.slot ? "slot-error" : undefined} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {activeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    role="radio"
                    aria-checked={slot.id === slotId}
                    onClick={() => {
                      setSlotId(slot.id);
                      setErrors((current) => ({ ...current, slot: undefined, form: undefined }));
                    }}
                    className={cn(
                      "rounded-sm border px-3 py-2.5 text-sm tabular-nums transition-colors",
                      slot.id === slotId ? "border-gold-600 bg-gold-500 font-medium text-black" : "border-fg/15 bg-surface-raised hover:border-gold-600/50",
                    )}
                  >
                    {timeLabel.format(new Date(slot.start))}
                  </button>
                ))}
            </div>
          </>
        )}
        {errors.slot && (
          <p id="slot-error" className="mt-3 text-sm text-danger-fg">
            {errors.slot}
          </p>
        )}
        {selected && (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
            <CalendarDays aria-hidden className="size-4" strokeWidth={1.5} />
            {t("selectedSlot", { date: fullLabel.format(new Date(selected.start)) })}
          </p>
        )}
      </section>

      <section aria-labelledby="details-title" className="space-y-5">
        <h2 id="details-title" className="text-2xl">
          {t("formTitle")}
        </h2>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("modeLabel")}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((mode) => (
              <label
                key={mode}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors",
                  values.mode === mode ? "border-gold-600 bg-gold-500/10" : "border-fg/15 bg-surface-raised hover:border-gold-600/50",
                )}
              >
                <input type="radio" name="mode" value={mode} checked={values.mode === mode} onChange={() => set("mode")(mode)} className="accent-gold-600" />
                {t(`modes.${mode}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="rdv-topic" label={t("topicLabel")} required>
          <Select id="rdv-topic" options={topics} value={values.topic} onChange={(e) => set("topic")(e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="rdv-name" label={tForm("fullName")} required error={errors.full_name}>
            <TextInput id="rdv-name" autoComplete="name" value={values.full_name} onChange={(e) => set("full_name")(e.target.value)} error={errors.full_name} />
          </Field>
          <Field id="rdv-email" label={tForm("email")} required error={errors.email}>
            <TextInput id="rdv-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} />
          </Field>
          <Field id="rdv-phone" label={tForm("phone")} optional error={errors.phone}>
            <TextInput id="rdv-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone} />
          </Field>
          <Field id="rdv-company" label={tForm("company")} optional>
            <TextInput id="rdv-company" autoComplete="organization" value={values.company} onChange={(e) => set("company")(e.target.value)} />
          </Field>
        </div>
        <Field id="rdv-message" label={t("messageLabel")} optional>
          <TextArea id="rdv-message" rows={4} maxLength={2000} value={values.message} onChange={(e) => set("message")(e.target.value)} />
        </Field>
        <ConsentCheckbox id="rdv-consent" checked={values.consent} onChange={set("consent")} error={errors.consent} />
        <FormAlert message={errors.form} />
        <SubmitButton pending={pending} label={t("submit")} />
        <RecaptchaNotice />
      </section>
    </form>
  );
}
