import AsyncStorage from "@react-native-async-storage/async-storage";

console.log("✅ workEntries.ts loaded");
export  type WorkEntry = {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  pause: string; // wir speichern wie deine Inputs (String)
  hours: string; // "8" oder "8,5"
  plannedEnd: string; // berechnet, z.B. "17:00"
  actualEnd?: string; // optional, falls du das Feld schon hast
  diff?: string; // optional, falls du das Feld schon hast
};

const KEY = "work_entries_v1";

export async function loadEntries(): Promise<WorkEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as WorkEntry[]) : [];
}

export async function addEntry(entry: WorkEntry): Promise<WorkEntry[]> {
  const list = await loadEntries();
  const next = [entry, ...list]; // neu oben
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearEntries() {
  await AsyncStorage.removeItem(KEY);
}

export async function deleteEntry(id: string): Promise<WorkEntry[]> {
  const list = await loadEntries();
  const updated = list.filter((item) => item.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export async function updateEntry(
  updatedEntry: WorkEntry,
): Promise<WorkEntry[]> {
  const list = await loadEntries();

  const updated = list.map((item) =>
    item.id === updatedEntry.id ? updatedEntry : item,
  );

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}