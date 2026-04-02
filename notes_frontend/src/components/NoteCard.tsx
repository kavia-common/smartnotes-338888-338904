import React from "react";
import type { Note } from "@/lib/types";

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

type Props = {
  note: Note;
  view: "grid" | "list";
  selected?: boolean;
  onOpen: () => void;
  onTogglePinned: () => void;
};

// PUBLIC_INTERFACE
export function NoteCard({ note, view, selected, onOpen, onTogglePinned }: Props) {
  /** Small note preview card for grid/list display. */
  const container = `sn-surface p-3 hover:shadow-md transition cursor-pointer ${
    selected ? "ring-2 ring-[color-mix(in_srgb,var(--sn-primary)_60%,transparent)]" : ""
  }`;
  const contentPreview = (note.content || "").slice(0, view === "grid" ? 160 : 260);

  return (
    <div className={container} onClick={onOpen} role="button" tabIndex={0}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{note.title || "Untitled"}</div>
          <div className="mt-1 text-xs text-[var(--sn-muted)]">Updated {formatTime(note.updatedAt)}</div>
        </div>

        <button
          className={`shrink-0 rounded-md px-2 py-1 text-xs sn-focus-ring ${
            note.pinned ? "bg-[color-mix(in_srgb,var(--sn-primary)_16%,white)]" : "hover:bg-black/5"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePinned();
          }}
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
        >
          {note.pinned ? "Pinned" : "Pin"}
        </button>
      </div>

      {contentPreview ? <p className="mt-2 text-sm text-[var(--sn-text)]/90 whitespace-pre-wrap">{contentPreview}</p> : null}

      {note.tags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-[var(--sn-border)] bg-white px-2 py-1 text-xs text-[var(--sn-muted)]"
            >
              #{t}
            </span>
          ))}
          {note.tags.length > 6 ? (
            <span className="text-xs text-[var(--sn-muted)]">+{note.tags.length - 6} more</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
