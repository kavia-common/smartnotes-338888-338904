import React from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  tags: string[];
  activeTag?: string;
  showPinnedOnly: boolean;
  onSelectTag: (tag?: string) => void;
  onTogglePinnedOnly: () => void;
  onOpenSettings: () => void;
};

// PUBLIC_INTERFACE
export function Sidebar({ tags, activeTag, showPinnedOnly, onSelectTag, onTogglePinnedOnly, onOpenSettings }: Props) {
  /** Left sidebar: app title, filters, and tag list. */
  return (
    <aside className="w-full md:w-72 shrink-0 md:h-[calc(100vh-24px)] sn-surface p-4 sn-scroll overflow-auto">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-[var(--sn-muted)]">SmartNotes</div>
          <div className="text-lg font-semibold">Your notes</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} aria-label="Open settings">
          Settings
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant={showPinnedOnly ? "primary" : "secondary"}
          size="sm"
          onClick={onTogglePinnedOnly}
          aria-pressed={showPinnedOnly}
        >
          Pinned
        </Button>
        <Button
          variant={!activeTag ? "primary" : "secondary"}
          size="sm"
          onClick={() => onSelectTag(undefined)}
          aria-pressed={!activeTag}
        >
          All
        </Button>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wide text-[var(--sn-muted)]">Tags</div>
        {tags.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--sn-muted)]">No tags yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {tags.map((t) => (
              <li key={t}>
                <button
                  className={`w-full text-left rounded-lg px-2 py-2 text-sm sn-focus-ring hover:bg-black/5 ${
                    activeTag === t ? "bg-[color-mix(in_srgb,var(--sn-accent)_18%,white)]" : ""
                  }`}
                  onClick={() => onSelectTag(t)}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-[var(--sn-accent)]" aria-hidden="true" />
                    {t}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--sn-border)]">
        <div className="text-xs text-[var(--sn-muted)]">
          Offline-first. Changes are queued for sync when backend mode is enabled.
        </div>
      </div>
    </aside>
  );
}
