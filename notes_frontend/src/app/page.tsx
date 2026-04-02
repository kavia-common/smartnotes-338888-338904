"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AppMode, Loadable, Note, NotesQuery } from "@/lib/types";
import { apiCreateNote, apiDeleteNote, apiListAllTags, apiListNotes, apiUpdateNote, getAppMode } from "@/lib/api/notesApi";
import { Sidebar } from "@/components/Sidebar";
import { NoteCard } from "@/components/NoteCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NoteEditorModal } from "@/components/NoteEditorModal";
import { SettingsModal } from "@/components/SettingsModal";

type ViewMode = "grid" | "list";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("local");

  const [query, setQuery] = useState<NotesQuery>({
    search: "",
    tag: undefined,
    pinnedOnly: false,
    archived: false,
    sort: "updated_desc",
  });

  const [view, setView] = useState<ViewMode>("grid");

  const [tags, setTags] = useState<Loadable<string[]>>({ state: "idle" });
  const [notes, setNotes] = useState<Loadable<Note[]>>({ state: "idle" });

  const [selected, setSelected] = useState<Note | undefined>(undefined);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredTitle = useMemo(() => {
    if (query.pinnedOnly) return "Pinned notes";
    if (query.tag) return `Tag: ${query.tag}`;
    if (query.search?.trim()) return `Search: “${query.search.trim()}”`;
    return "All notes";
  }, [query.pinnedOnly, query.tag, query.search]);

  async function refresh() {
    setNotes((s) => ({ state: "loading", data: s.data }));
    setTags((s) => ({ state: "loading", data: s.data }));
    try {
      const [n, t] = await Promise.all([apiListNotes(mode, query), apiListAllTags(mode)]);
      setNotes({ state: "ready", data: n });
      setTags({ state: "ready", data: t });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setNotes({ state: "error", error: msg, data: [] });
      setTags({ state: "error", error: msg, data: [] });
    }
  }

  useEffect(() => {
    setMode(getAppMode());
  }, []);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, query.tag, query.search, query.pinnedOnly, query.archived, query.sort]);

  async function createNote(input: { title: string; content: string; tags: string[]; pinned?: boolean }) {
    await apiCreateNote(mode, input);
    await refresh();
  }

  async function updateNote(noteId: string, patch: Partial<Pick<Note, "title" | "content" | "tags" | "pinned">>) {
    await apiUpdateNote(mode, noteId, patch);
    await refresh();
  }

  async function deleteNote(noteId: string) {
    await apiDeleteNote(mode, noteId);
    await refresh();
  }

  return (
    <main className="min-h-screen p-3 md:p-6 bg-[var(--sn-bg)]">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row gap-3 md:gap-6">
        <Sidebar
          tags={tags.state === "ready" ? tags.data : tags.state === "loading" && tags.data ? tags.data : []}
          activeTag={query.tag}
          showPinnedOnly={Boolean(query.pinnedOnly)}
          onSelectTag={(tag) => setQuery((q) => ({ ...q, tag }))}
          onTogglePinnedOnly={() => setQuery((q) => ({ ...q, pinnedOnly: !q.pinnedOnly }))}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <section className="flex-1 md:h-[calc(100vh-24px)] sn-surface p-4 flex flex-col min-w-0">
          {/* Toolbar */}
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-[var(--sn-border)]">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{filteredTitle}</h1>
              <p className="text-sm text-[var(--sn-muted)]">
                Mode: <span className="font-medium">{mode}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="w-full sm:w-72">
                <Input
                  label="Search"
                  value={query.search ?? ""}
                  onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value }))}
                  placeholder="Title, content, tags…"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
                  aria-label="Toggle view"
                >
                  {view === "grid" ? "List" : "Grid"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelected(undefined);
                    setEditorOpen(true);
                  }}
                >
                  New note
                </Button>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="pt-4 flex-1 overflow-auto sn-scroll">
            {notes.state === "loading" ? (
              <div className="text-sm text-[var(--sn-muted)]">Loading notes…</div>
            ) : null}

            {notes.state === "error" ? (
              <div role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-sm text-[#991b1b]">
                {notes.error}
                <div className="mt-2">
                  <Button variant="secondary" size="sm" onClick={refresh}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            {notes.state === "ready" && notes.data.length === 0 ? (
              <div className="mt-6 sn-surface p-6 text-center">
                <div className="text-lg font-semibold">No notes yet</div>
                <p className="mt-2 text-sm text-[var(--sn-muted)]">
                  Create your first note, add some tags, and pin your favorites.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelected(undefined);
                      setEditorOpen(true);
                    }}
                  >
                    Create a note
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setQuery((q) => ({
                        ...q,
                        search: "",
                        tag: undefined,
                        pinnedOnly: false,
                      }))
                    }
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : null}

            {notes.state === "ready" && notes.data.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-3"}>
                {notes.data.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    view={view}
                    selected={selected?.id === n.id}
                    onOpen={() => {
                      setSelected(n);
                      setEditorOpen(true);
                    }}
                    onTogglePinned={async () => {
                      await updateNote(n.id, { pinned: !n.pinned });
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <footer className="pt-4 mt-4 border-t border-[var(--sn-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--sn-muted)]">
            <span>
              Tips: Use tags like <span className="font-medium">work</span>, <span className="font-medium">ideas</span>,{" "}
              <span className="font-medium">personal</span>.
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-[var(--sn-accent)]" aria-hidden="true" />
              Offline-first storage
            </span>
          </footer>
        </section>
      </div>

      <NoteEditorModal
        open={editorOpen}
        mode={mode}
        note={selected}
        onClose={() => setEditorOpen(false)}
        onCreate={createNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onModeChanged={(m) => {
          setMode(m);
          // refresh on mode change
          void refresh();
        }}
      />
    </main>
  );
}
