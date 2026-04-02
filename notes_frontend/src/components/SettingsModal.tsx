import React, { useEffect, useState } from "react";
import type { AppMode } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { apiClearSyncQueue, apiGetSyncQueue, apiHealthCheck, getAppMode, setAppMode } from "@/lib/api/notesApi";

// PUBLIC_INTERFACE
export function SettingsModal({ open, onClose, onModeChanged }: { open: boolean; onClose: () => void; onModeChanged: (m: AppMode) => void }) {
  /** Settings modal: mode switching + sync queue visibility. */
  const [mode, setMode] = useState<AppMode>("local");
  const [health, setHealth] = useState<{ ok: boolean; message?: string } | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    const m = getAppMode();
    setMode(m);
    setHealth(undefined);
  }, [open]);

  const queue = apiGetSyncQueue();

  async function checkHealth(target: AppMode) {
    const result = await apiHealthCheck(target);
    setHealth(result);
  }

  return (
    <Modal
      open={open}
      title="Settings"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <h3 className="text-sm font-semibold">Mode</h3>
          <p className="text-sm text-[var(--sn-muted)] mt-1">
            Local mode stores everything in your browser and queues changes for sync. Backend mode will use the API when available.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={mode === "local" ? "primary" : "secondary"}
              onClick={() => {
                setAppMode("local");
                setMode("local");
                onModeChanged("local");
              }}
            >
              Local-only
            </Button>
            <Button
              variant={mode === "backend" ? "primary" : "secondary"}
              onClick={() => {
                setAppMode("backend");
                setMode("backend");
                onModeChanged("backend");
              }}
            >
              Backend
            </Button>
            <Button variant="ghost" onClick={() => checkHealth(mode)}>
              Check health
            </Button>
          </div>

          {health ? (
            <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${health.ok ? "border-[var(--sn-border)] bg-black/5" : "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#991b1b]"}`}>
              {health.ok ? "OK" : `Not ready: ${health.message ?? "Unknown error"}`}
            </div>
          ) : null}

          <div className="mt-3 text-xs text-[var(--sn-muted)]">
            Backend base URL: <code className="px-1 py-0.5 rounded bg-black/5">NEXT_PUBLIC_NOTES_API_BASE_URL</code>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Sync queue</h3>
          <p className="text-sm text-[var(--sn-muted)] mt-1">
            When you create/update/delete notes in Local mode, operations are appended to a queue for future sync.
          </p>

          <div className="mt-2 rounded-lg border border-[var(--sn-border)] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                Pending operations: <span className="font-semibold">{queue.length}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={queue.length === 0}
                onClick={() => {
                  if (!confirm("Clear sync queue? This does not delete notes, only queued ops.")) return;
                  apiClearSyncQueue();
                }}
              >
                Clear
              </Button>
            </div>

            {queue.length === 0 ? (
              <div className="mt-2 text-sm text-[var(--sn-muted)]">Queue is empty.</div>
            ) : (
              <ul className="mt-2 space-y-1 text-xs text-[var(--sn-muted)] max-h-44 overflow-auto sn-scroll">
                {queue.slice().reverse().slice(0, 25).map((op) => (
                  <li key={op.opId} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      <span className="font-medium text-[var(--sn-text)]">{op.type}</span>{" "}
                      {"noteId" in op ? op.noteId : op.note.id}
                    </span>
                    <span className="shrink-0">{op.opId.slice(0, 8)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
