import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LabeledInput from "../../components/LabeledInput";
import {
  clearEntries,
  deleteEntry,
  loadEntries,
  updateEntry,
  WorkEntry,
} from "../../storage/workEntries";

function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay(); // So = 7
  d.setHours(0, 0, 0, 0);

  const start = new Date(d);
  start.setDate(d.getDate() - day + 1);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
}

function isDateInCurrentWeek(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const { start, end } = getWeekRange();
  date.setHours(0, 0, 0, 0);

  return date >= start && date <= end;
}

function sumMinutesFromHHMM(value?: string) {
  if (!value || value === "--:--") return 0;
  const match = /^([+-]?)(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hh = Number(match[2]);
  const mm = Number(match[3]);

  return sign * (hh * 60 + mm);
}

function formatMinutesToHHMM(total: number) {
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function isSameDate(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

function groupEntriesByRelativeWeek(entries: WorkEntry[]) {
  const now = new Date();

  const thisWeekStart = getStartOfWeek(now);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const result = {
    thisWeek: [] as WorkEntry[],
    lastWeek: [] as WorkEntry[],
    older: [] as WorkEntry[],
  };

  for (const item of entries) {
    const itemDate = new Date(item.date);
    if (Number.isNaN(itemDate.getTime())) {
      result.older.push(item);
      continue;
    }

    const itemWeekStart = getStartOfWeek(itemDate);

    if (isSameDate(itemWeekStart, thisWeekStart)) {
      result.thisWeek.push(item);
    } else if (isSameDate(itemWeekStart, lastWeekStart)) {
      result.lastWeek.push(item);
    } else {
      result.older.push(item);
    }
  }

  return result;
}
export default function HistoryScreen() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const groupedEntries = groupEntriesByRelativeWeek(entries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editPause, setEditPause] = useState("");

  const handleUpdate = async (item: WorkEntry) => {
    const plannedEnd = calculatePlannedEnd(
      editStartTime,
      editPause,
      item.hours,
    );

    const updatedItem: WorkEntry = {
      ...item,
      startTime: editStartTime,
      pause: editPause,
      actualEnd: editActualEnd.trim() ? editActualEnd : undefined,
      plannedEnd,
      diff: editActualEnd.trim()
        ? calculateDiff(plannedEnd, editActualEnd)
        : "",
    };

    const updated = await updateEntry(updatedItem);
    setEntries(updated);
    setEditingId(null);
  };

  const handleEdit = (item: WorkEntry) => {
    setEditingId(item.id);
    setEditStartTime(item.startTime);
    setEditPause(item.pause);
    setEditActualEnd(item.actualEnd || "");
  };
  const [editActualEnd, setEditActualEnd] = useState("");
  const weeklyEntries = entries.filter((item) =>
    isDateInCurrentWeek(item.date),
  );

  const weeklyWorkedMinutes = weeklyEntries.reduce((sum, item) => {
    const worked = calculateWorkedHours(
      item.startTime,
      item.actualEnd,
      item.pause,
    );
    return sum + sumMinutesFromHHMM(worked);
  }, 0);

  const weeklyDiffMinutes = weeklyEntries.reduce((sum, item) => {
    return sum + sumMinutesFromHHMM(item.diff);
  }, 0);

  const refresh = async () => {
    const list = await loadEntries();
    setEntries(list);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  const handleClear = async () => {
    await clearEntries();
    refresh();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Eintrag löschen",
      "Willst du diesen Eintrag wirklich löschen?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            const updated = await deleteEntry(id);
            setEntries(updated);
          },
        },
      ],
    );
  };
  const renderSection = (title: string, items: WorkEntry[]) => {
    if (items.length === 0) return null;

    return (
      <View style={{ marginTop: 18 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "900",
            marginBottom: 10,
          }}
        >
          {title}
        </Text>

        {items.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: "#1a1a1a",
              padding: 14,
              borderRadius: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#2a2a2a",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {formatDate(item.date)}
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => handleEdit(item)}
                  style={({ pressed }) => ({
                    backgroundColor: "#1d4ed8",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}
                  >
                    Bearbeiten
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => ({
                    backgroundColor: "#7a1f1f",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}
                  >
                    Löschen
                  </Text>
                </Pressable>
              </View>
            </View>

            {editingId === item.id ? (
              <View style={{ marginTop: 10, gap: 10 }}>
                <LabeledInput
                  label="Startzeit"
                  value={editStartTime}
                  onChangeText={setEditStartTime}
                  placeholder="08:30"
                  keyboardType="numbers-and-punctuation"
                />

                <LabeledInput
                  label="Pause"
                  value={editPause}
                  onChangeText={setEditPause}
                  placeholder="30"
                  keyboardType="number-pad"
                />

                <LabeledInput
                  label="Tatsächliche Endzeit"
                  value={editActualEnd}
                  onChangeText={setEditActualEnd}
                  placeholder="17:10"
                  keyboardType="numbers-and-punctuation"
                />

                <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                  <Pressable
                    onPress={() => handleUpdate(item)}
                    style={{
                      flex: 1,
                      backgroundColor: "#166534",
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      Speichern
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditingId(null)}
                    style={{
                      flex: 1,
                      backgroundColor: "#444",
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      Abbrechen
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {item.startTime}
                  </Text>

                  <Text
                    style={{
                      color: "#9aa0a6",
                      marginHorizontal: 6,
                      fontSize: 16,
                    }}
                  >
                    →
                  </Text>

                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {item.actualEnd || item.plannedEnd}
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#9aa0a6",
                    fontSize: 14,
                    marginTop: 6,
                  }}
                >
                  Pause: {item.pause} min
                </Text>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "900",
                    marginTop: 8,
                  }}
                >
                  Gearbeitet:{" "}
                  {calculateWorkedHours(
                    item.startTime,
                    item.actualEnd,
                    item.pause,
                  )}
                </Text>

                {!!item.diff && (
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 16,
                      fontWeight: "900",
                      color: item.diff.startsWith("+")
                        ? "#16a34a"
                        : item.diff.startsWith("-")
                          ? "#dc2626"
                          : "#9aa0a6",
                    }}
                  >
                    {item.diff}
                  </Text>
                )}
              </>
            )}
          </View>
        ))}
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040303" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "900",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          History
        </Text>
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#2a2a2a",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "900",
              marginBottom: 10,
            }}
          >
            Diese Woche
          </Text>

          <Text style={{ color: "#d1d5db", fontSize: 14 }}>
            Einträge: {weeklyEntries.length}
          </Text>

          <Text style={{ color: "#d1d5db", fontSize: 14, marginTop: 4 }}>
            Gearbeitet: {formatMinutesToHHMM(weeklyWorkedMinutes)} h
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              marginTop: 4,
              color:
                weeklyDiffMinutes > 0
                  ? "#16a34a"
                  : weeklyDiffMinutes < 0
                    ? "#dc2626"
                    : "#9aa0a6",
            }}
          >
            Überstunden: {weeklyDiffMinutes > 0 ? "+" : ""}
            {formatMinutesToHHMM(weeklyDiffMinutes)}
          </Text>
        </View>
        <Text
          style={{
            color: "#9aa0a6",
            fontSize: 14,
            marginBottom: 14,
          }}
        >
          Deine gespeicherten Arbeitszeiten
        </Text>

        <Pressable
          onPress={handleClear}
          style={({ pressed }) => ({
            marginTop: 14,
            backgroundColor: "#7a1f1f",
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Alle Einträge löschen
          </Text>
        </Pressable>

        <View style={{ marginTop: 16, gap: 10 }}>
          {entries.length === 0 ? (
            <Text style={{ color: "#9aa0a6" }}>Noch keine Einträge.</Text>
          ) : (
            <>
              {renderSection("Diese Woche", groupedEntries.thisWeek)}
              {renderSection("Letzte Woche", groupedEntries.lastWeek)}
              {renderSection("Älter", groupedEntries.older)}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function calculateWorkedHours(
  startTime: string,
  actualEnd?: string,
  pause?: string,
) {
  if (!actualEnd) return "--:--";

  const parseTime = (value: string) => {
    const [hh, mm] = value.split(":").map(Number);
    if (
      !Number.isFinite(hh) ||
      !Number.isFinite(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      return null;
    }
    return hh * 60 + mm;
  };

  const start = parseTime(startTime);
  const end = parseTime(actualEnd);
  const pauseMin = Number((pause || "0").replace(",", "."));

  if (start === null || end === null || !Number.isFinite(pauseMin)) {
    return "--:--";
  }

  let total = end - start - Math.round(pauseMin);

  if (total < 0) {
    total += 24 * 60;
  }

  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseTime(value: string) {
  const [hh, mm] = value.split(":").map(Number);
  if (
    !Number.isFinite(hh) ||
    !Number.isFinite(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return null;
  }
  return hh * 60 + mm;
}

function formatTime(totalMinutes: number) {
  let mins = totalMinutes % (24 * 60);
  if (mins < 0) mins += 24 * 60;

  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}

function calculatePlannedEnd(startTime: string, pause: string, hours: string) {
  const start = parseTime(startTime);
  const pauseMin = Number((pause || "").replace(",", "."));
  const workMin = Number((hours || "").replace(",", ".")) * 60;

  if (
    start === null ||
    !Number.isFinite(pauseMin) ||
    !Number.isFinite(workMin)
  ) {
    return "";
  }

  return formatTime(start + Math.round(pauseMin) + Math.round(workMin));
}

function calculateDiff(planned: string, actual: string) {
  const plannedMin = parseTime(planned);
  const actualMin = parseTime(actual);

  if (plannedMin === null || actualMin === null) return "";

  const d = actualMin - plannedMin;
  const sign = d >= 0 ? "+" : "-";
  const abs = Math.abs(d);

  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");

  return `${sign}${hh}:${mm}`;
}
