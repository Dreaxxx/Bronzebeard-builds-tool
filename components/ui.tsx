import { clsx } from "clsx";
import * as React from "react";

/** Carte “glass” */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card p-4", className)} {...props} />;
}

/** Bouton */
export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
}) {
  const base = "btn";
  const look =
    variant === "primary"
      ? "btn-primary"
      : variant === "ghost"
        ? "btn-ghost"
        : variant === "danger"
          ? "btn-danger"
          : "";
  return <button className={clsx(base, look, className)} {...props} />;
}

/** Champ texte */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("input", className)} {...props} />;
}

/** Select natif (trigger stylé) */
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx("select", className)} {...props} />;
}

/** Zone de texte */
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx("textarea", className)} {...props} />;
}

/** Label simple */
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx("mb-1 block text-xs font-medium text-[hsl(var(--muted-fg))]", className)}
      {...props}
    />
  );
}

/** Petites pastilles (“Pill”) */
export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx("pill", className)} {...props} />;
}

/** Badge (compact) */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx("badge", className)} {...props} />;
}

/** Segmented control simple (tu peux l’utiliser pour les tiers) */
export function Segmented({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={clsx("segmented", className)}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} className={clsx(active && "active")} onClick={() => onChange(opt)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={clsx("btn btn-primary", props.className)} />;
}

// Ligne/row de formulaire responsive (label + champ)
export function Row({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3", className)}
      {...props}
    />
  );
}
