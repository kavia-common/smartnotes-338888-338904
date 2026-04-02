import React, { useMemo, useState } from "react";
import type { AppMode, Note, NoteCreateInput } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function parseTags(input: string): string[] {
  const parts = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  // de-dupe, preserve order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

type Props = {
  open: boolean;
  mode: AppMode;
  note?: Note;
  onClose: () => void;
  onCreate: (input: NoteCreateInput) => Promise<void>;
  onUpdate: (noteId: string, patch: Partial<Pick<Note, "title" | "content" | "tags" | "pinned">>) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
};

// PUBLIC_INTERFACE
export function NoteEditorModal({ open, mode, note, onClose, onCreate, onUpdate, onDelete }: Props) {
  /** Create/edit note modal. Works in both local and backend mode. */
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tagsInput, setTagsInput] = useState((note?.tags ?? []).join(", "));
  const [pinned, setPinned] = useState(Boolean(note?.pinned));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setTagsInput((note?.tags ?? []).join(", "));
    setPinned(Boolean(note?.pinned));
    setErr(undefined);
    setBusy(false);
  }, [open, note]);

  const tags = useMemo(() => parseTags(tagsInput), [tagsInput]);

  async function handleSave() {
    setErr(undefined);
    setBusy(true);
    try {
      if (note) {
        await onUpdate(note.id, { title, content, tags, pinned });
      } else {
        await onCreate({ title, content, tags, pinned });
      }
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!note) return;
    if (!confirm("Delete this note?")) return;
    setErr(undefined);
    setBusy(true);
    try {
      await onDelete(note.id);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={note ? "Edit note" : "New note"}
      onClose={onClose}
      footer={
        <>
          {note ? (
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              Delete
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
          </div>
          <div className="sm:w-40">
            <label className="block text-sm">
              <span className="block mb-1 text-[var(--sn-muted)]">Pinned</span>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-sm sn-focus-ring ${
                  pinned ? "bg-[color-mix(in_srgb,var(--sn-primary)_16%,white)] border-[var(--sn-border)]" : "bg-white border-[var(--sn-border)]"
                }`}
                onClick={() => setPinned((p) => !p)}
                aria-pressed={pinned}
                type="button"
              >
                {pinned ? "Yes" : "No"}
              </button>
            </label>
          </div>
        </div>

        <label className="block text-sm">
          <span className="block mb-1 text-[var(--sn-muted)]">Content</span>
          <textarea
            className="w-full min-h-56 rounded-lg border border-[var(--sn-border)] bg-white px-3 py-2 text-sm sn-focus-ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note…"
          />
        </label>

        <Input
          label="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="work, personal, ideas"
        />

        <div className="text-xs text-[var(--sn-muted)]">
          Mode: <span className="font-medium">{mode}</span> {mode === "local" ? "(offline-first)" : "(backend)"}.
        </div>

        {err ? (
          <div role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-sm text-[#991b1b]">
            {err}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
