import React, { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
};

// PUBLIC_INTERFACE
export function Modal({ open, title, children, onClose, footer }: Props) {
  /** Accessible-ish modal with ESC to close and backdrop click. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative mx-auto mt-10 w-[min(720px,calc(100%-24px))] sn-surface p-4"
      >
        <header className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--sn-border)]">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button className="sn-focus-ring rounded-md px-2 py-1 text-sm hover:bg-black/5" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="pt-4">{children}</div>

        {footer ? (
          <footer className="pt-4 mt-4 border-t border-[var(--sn-border)] flex items-center justify-end gap-2">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
