"use client";
import clsx from "clsx";
import React from "react";
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={clsx("btn", className)} {...props} />; }
export function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={clsx("btn btn-primary", className)} {...props} />; }
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props} />; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="input min-h-[120px]" {...props} />; }
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) { return <label className="label" {...props} />; }
export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("card", className)}>{children}</div>; }
export function Row({ children, className }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("flex flex-wrap items-center gap-3", className)}>{children}</div>; }
export function Pill({ children }: React.PropsWithChildren) { return <span className="badge">{children}</span>; }

export function Select(
    { className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>
) {
    return (
        <div className="relative">
            <select
                className={clsx(
                    // base "input" if you have it, otherwise custom styles:
                    "w-full rounded-md border bg-neutral-900 text-neutral-100",
                    "border-neutral-700 placeholder-neutral-400",
                    "px-3 py-2 pr-9 outline-none",
                    "focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "appearance-none", 
                    className
                )}
                {...props}
            />
            {/* visible for screen readers */}
            <svg
                aria-hidden
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"
                viewBox="0 0 20 20" fill="currentColor"
            >
                <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
            </svg>
        </div>
    );
}