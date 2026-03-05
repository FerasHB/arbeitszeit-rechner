import { useEffect, useState } from "react";
import { addEntry, loadEntries, WorkEntry } from "../storage/workEntries";

type SavePayload = Omit<WorkEntry, "id">;

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const list = await loadEntries();
    setEntries(list);
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveEntry(payload: SavePayload) {
    const entry: WorkEntry = { id: String(Date.now()), ...payload };
    await addEntry(entry);
    await refresh();
    return entry;
  }

  return { entries, loading, saveEntry, refresh };
}