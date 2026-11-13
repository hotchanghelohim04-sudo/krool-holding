"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { recaptchaEnabled } from "@/lib/recaptcha";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

const controlClass = (tone: Tone, invalid: boolean) =>
  cn(
    "block w-full rounded-sm border px-3.5 py-2.5 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-0",
    tone === "dark"
      ? "border-ink-700 bg-ink-900 text-paper placeholder:text-slate-500"
      : "border-fg/20 bg-surface-raised text-fg placeholder:text-slate-500",
    invalid && (tone === "dark" ? "border-red-400" : "border-danger"),
  );

export function Field({
  id,
  label,
  required,
  optional,
  error,
  hint,
  tone = "light",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  tone?: Tone;
  children: ReactNode;
}) {
  const t = useTranslations("Form");
  return (
    <div>
      <label htmlFor={id} className={cn("mb-1.5 block text-sm font-medium", tone === "dark" ? "text-paper" : "text-fg")}>
        {label}
        {required && <span aria-hidden className="ml-0.5 text-gold-600">*</span>}
        {optional && (
          <span className={cn("ml-1.5 font-normal", tone === "dark" ? "text-slate-300" : "text-fg-muted")}>
            ({t("optional")})
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={cn("mt-1.5 text-sm", tone === "dark" ? "text-slate-300" : "text-fg-muted")}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={cn("mt-1.5 flex items-start gap-1.5 text-sm", tone === "dark" ? "text-red-300" : "text-danger-fg")}>
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function TextInput({
  id,
  error,
  hint,
  tone = "light",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hint?: string; tone?: Tone }) {
  return (
    <input
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(controlClass(tone, Boolean(error)), className)}
      {...props}
    />
  );
}

export function TextArea({
  id,
  error,
  hint,
  tone = "light",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hint?: string; tone?: Tone }) {
  return (
    <textarea
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(controlClass(tone, Boolean(error)), "min-h-36 resize-y")}
      {...props}
    />
  );
}

export function Select({
  id,
  error,
  hint,
  tone = "light",
  options,
  placeholder,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  error?: string;
  hint?: string;
  tone?: Tone;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={controlClass(tone, Boolean(error))}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Case de consentement obligatoire, avec lien vers la politique de confidentialité. */
export function ConsentCheckbox({
  id,
  checked,
  onChange,
  error,
  tone = "light",
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  tone?: Tone;
}) {
  const t = useTranslations("Form");
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-4 shrink-0 accent-gold-600"
        />
        <label htmlFor={id} className={cn("text-sm", tone === "dark" ? "text-slate-300" : "text-fg-muted")}>
          {t.rich("consent", {
            link: (chunks) => (
              <Link href="/confidentialite" className={cn("underline underline-offset-2", tone === "dark" ? "text-gold-300" : "text-accent")}>
                {chunks}
              </Link>
            ),
          })}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className={cn("mt-1.5 text-sm", tone === "dark" ? "text-red-300" : "text-danger-fg")}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Champ piège anti-robots : invisible et ignoré par les humains (et les lecteurs
 * d'écran), souvent rempli par les robots. Le serveur ignore alors la demande.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("Form");
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        {t("honeypot")}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

export function SubmitButton({
  pending,
  label,
  className,
}: {
  pending: boolean;
  label: string;
  className?: string;
}) {
  const t = useTranslations("Form");
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonStyles("primary", "lg", className)}>
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {pending ? t("sending") : label}
    </button>
  );
}

/**
 * Mention exigée par Google quand le badge reCAPTCHA est masqué.
 * N'apparaît que si reCAPTCHA est actif (clé de site configurée).
 */
export function RecaptchaNotice({ tone = "light" }: { tone?: Tone }) {
  const t = useTranslations("Form");
  if (!recaptchaEnabled) return null;
  const linkClass = cn("underline underline-offset-2", tone === "dark" ? "text-slate-300" : "text-fg-muted");
  return (
    <p className={cn("text-xs", tone === "dark" ? "text-slate-300" : "text-fg-muted")}>
      {t.rich("recaptchaNotice", {
        privacy: (chunks) => (
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
          </a>
        ),
        terms: (chunks) => (
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}

/** Message global (erreur) annoncé aux lecteurs d'écran. */
export function FormAlert({ message, tone = "light" }: { message?: string; tone?: Tone }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-sm border px-4 py-3 text-sm",
        tone === "dark" ? "border-red-400/50 bg-red-950/40 text-red-200" : "border-danger/40 bg-danger/5 text-danger-fg",
      )}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
      {message}
    </div>
  );
}

/** Écran de réussite après envoi (le focus y est déplacé). */
export function FormSuccess({
  title,
  text,
  tone = "light",
  children,
}: {
  title: string;
  text: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      tabIndex={-1}
      ref={(node) => node?.focus()}
      className={cn(
        "rounded-lg border p-6 outline-none",
        tone === "dark" ? "border-gold-500/40 bg-ink-900 text-paper" : "border-success/30 bg-success/5",
      )}
    >
      <p className="flex items-center gap-2 text-lg font-semibold">
        <CircleCheck aria-hidden className={cn("size-5", tone === "dark" ? "text-gold-400" : "text-success-fg")} strokeWidth={1.5} />
        {title}
      </p>
      <p className={cn("mt-2", tone === "dark" ? "text-slate-300" : "text-fg-muted")}>{text}</p>
      {children}
    </div>
  );
}
