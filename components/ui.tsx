"use client";
import clsx from "clsx";
import React from "react";
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={clsx("btn", className)} {...props} />; }
export function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={clsx("btn btn-primary", className)} {...props} />; }
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props} />; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="input min-h-[120px]" {...props} />; }
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) { return <label className="label" {...props} />; }
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select className={clsx("input", className)} {...props} />; }
export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("card", className)}>{children}</div>; }
export function Row({ children, className }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("flex flex-wrap items-center gap-3", className)}>{children}</div>; }
export function Pill({ children }: React.PropsWithChildren) { return <span className="badge">{children}</span>; }
