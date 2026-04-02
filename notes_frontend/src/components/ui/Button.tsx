import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

// PUBLIC_INTERFACE
export function Button({ variant = "secondary", size = "md", className = "", ...props }: Props) {
  /** Reusable button with a small set of variants. */
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition px-3 py-2 sn-focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-2 py-1 text-xs rounded-md" : "";
  const v =
    variant === "primary"
      ? "bg-[var(--sn-primary)] border-[color-mix(in_srgb,var(--sn-primary)_70%,black)] text-white hover:opacity-95"
      : variant === "danger"
        ? "bg-[#ef4444] border-[#ef4444] text-white hover:opacity-95"
        : variant === "ghost"
          ? "bg-transparent border-transparent hover:bg-black/5 text-[var(--sn-text)]"
          : "bg-white border-[var(--sn-border)] hover:bg-black/5 text-[var(--sn-text)]";

  return <button className={`${base} ${v} ${sizes} ${className}`} {...props} />;
}
