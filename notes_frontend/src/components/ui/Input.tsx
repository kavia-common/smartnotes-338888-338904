import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

// PUBLIC_INTERFACE
export function Input({ label, className = "", ...props }: Props) {
  /** Reusable input with optional label. */
  return (
    <label className="block text-sm">
      {label ? <span className="block mb-1 text-[var(--sn-muted)]">{label}</span> : null}
      <input
        className={`w-full rounded-lg border border-[var(--sn-border)] bg-white px-3 py-2 text-sm sn-focus-ring ${className}`}
        {...props}
      />
    </label>
  );
}
