import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HistorySection from "../../components/history/history-section";
import WeeklySummaryCard from "../../components/history/weekly-summary-card";
import { Colors, Layout, Typography } from "../../constants/theme";
import {
  clearEntries,
  deleteEntry,
  loadEntries,
  updateEntry,
  type WorkEntry,
} from "../../storage/workEntries";

// ─── Hilfsfunktionen: Datum & Woche ──────────────────────────────────────────

// Gibt Start (Montag) und Ende (Sonntag) der aktuellen Woche zurück
function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay(); // Sonntag (0) → 7 (ISO-Woche)
  d.setHours(0, 0, 0, 0);

  const start = new Date(d);
  start.setDate(d.getDate() - day + 1); // Montag

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sonntag

  return { start, end };
}

// Gibt den Montag der Woche zurück, in der `date` liegt
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

// Prüft ob zwei Datumsangaben in derselben Kalenderwoche liegen
function isSameWeek(dateA: Date, dateB: Date) {
  return getStartOfWeek(dateA).getTime() === getStartOfWeek(dateB).getTime();
}

// Sortiert Einträge in drei Gruppen: diese Woche, letzte Woche, älter
function groupEntriesByRelativeWeek(entries: WorkEntry[]) {
  const now = new Date();
  const currentWeekStart = getStartOfWeek(now);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeek: WorkEntry[] = [];
  const lastWeek: WorkEntry[] = [];
  const older: WorkEntry[] = [];

  entries.forEach((item) => {
    const date = new Date(item.date);

    // Ungültiges Datum → sicherheitshalber in "Älter" einsortieren
    if (Number.isNaN(date.getTime())) {
      older.push(item);
      return;
    }

    if (isSameWeek(date, now)) {
      thisWeek.push(item);
      return;
    }

    if (getStartOfWeek(date).getTime() === lastWeekStart.getTime()) {
      lastWeek.push(item);
      return;
    }

    older.push(item);
  });

  return { thisWeek, lastWeek, older };
}

// ─── Hilfsfunktionen: Zeit & Minuten ─────────────────────────────────────────

// Wandelt einen HH:MM-String (mit optionalem Vorzeichen) in Minuten um
// z.B. "+01:30" → 90, "-00:15" → -15
function sumMinutesFromHHMM(value?: string) {
  if (!value || value === "--:--") return 0;
  const match = /^([+-]?)(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hh = Number(match[2]);
  const mm = Number(match[3]);

  return sign * (hh * 60 + mm);
}

// Wandelt Gesamtminuten in einen HH:MM-String mit Vorzeichen um
// z.B. -90 → "-01:30"
function formatMinutesToHHMM(total: number) {
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

// Parst "HH:MM" → Minuten seit Mitternacht, oder null bei ungültiger Eingabe
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

// Wandelt Minuten seit Mitternacht in "HH:MM" um (mit Übernacht-Handling)
function formatTime(totalMinutes: number) {
  let mins = totalMinutes % (24 * 60);
  if (mins < 0) mins += 24 * 60; // Negativwert → nächster Tag

  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}

// Berechnet die geplante Endzeit aus Startzeit + Pause + Zielstunden
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

// Berechnet die Differenz zwischen tatsächlicher und geplanter Endzeit
// z.B. geplant 17:00, tatsächlich 17:15 → "+00:15"
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

// Berechnet tatsächlich gearbeitete Zeit (End - Start - Pause)
// Gibt "--:--" zurück wenn keine tatsächliche Endzeit vorhanden
function calculateWorkedHours(
  startTime: string,
  actualEnd?: string,
  pause?: string,
) {
  if (!actualEnd) return "--:--";

  const start = parseTime(startTime);
  const end = parseTime(actualEnd);
  const pauseMin = Number((pause || "0").replace(",", "."));

  if (start === null || end === null || !Number.isFinite(pauseMin)) {
    return "--:--";
  }

  let total = end - start - Math.round(pauseMin);
  if (total < 0) total += 24 * 60; // Nachtschicht-Handling

  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}

// Formatiert ein ISO-Datum (YYYY-MM-DD) in deutsches Format (DD.MM.YYYY)
function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  // ─── Zustände ──────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<WorkEntry[]>([]);

  // Bearbeitungs-Zustand: welcher Eintrag wird gerade editiert?
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editPause, setEditPause] = useState("");
  const [editActualEnd, setEditActualEnd] = useState("");

  // Einträge aus dem Speicher laden
  const refresh = async () => {
    const list = await loadEntries();
    setEntries(list);
  };

  // Neu laden sobald der Tab in den Fokus kommt (z.B. nach Speichern im HomeScreen)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  // ─── Berechnungen (gecacht mit useMemo) ────────────────────────────────────

  // Einträge in Gruppen aufteilen — nur neu berechnen wenn sich entries ändert
  const groupedEntries = useMemo(
    () => groupEntriesByRelativeWeek(entries),
    [entries],
  );

  // Nur Einträge der aktuellen Woche für die Wochenübersicht
  const weeklyEntries = entries.filter((item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) return false;
    const { start, end } = getWeekRange();
    date.setHours(0, 0, 0, 0);
    return date >= start && date <= end;
  });

  // Gesamte gearbeitete Minuten dieser Woche
  const weeklyWorkedMinutes = weeklyEntries.reduce((sum, item) => {
    const worked = calculateWorkedHours(
      item.startTime,
      item.actualEnd,
      item.pause,
    );
    return sum + sumMinutesFromHHMM(worked);
  }, 0);

  // Gesamte Über-/Unterstunden dieser Woche (kann negativ sein)
  const weeklyDiffMinutes = weeklyEntries.reduce((sum, item) => {
    return sum + sumMinutesFromHHMM(item.diff);
  }, 0);

  // ─── Event Handler ─────────────────────────────────────────────────────────

  // Bearbeitungsmodus für einen Eintrag starten
  const handleEdit = (item: WorkEntry) => {
    setEditingId(item.id);
    setEditStartTime(item.startTime);
    setEditPause(item.pause);
    setEditActualEnd(item.actualEnd || "");
  };

  // Geänderten Eintrag speichern und neu berechnen
  const handleUpdate = async (item: WorkEntry) => {
    const plannedEnd = calculatePlannedEnd(
      editStartTime,
      editPause,
      item.hours, // Zielstunden bleiben unverändert
    );

    const updatedItem: WorkEntry = {
      ...item,
      startTime: editStartTime,
      pause: editPause,
      actualEnd: editActualEnd.trim() ? editActualEnd : undefined,
      plannedEnd,
      // Differenz nur setzen wenn tatsächliche Endzeit vorhanden
      diff: editActualEnd.trim()
        ? calculateDiff(plannedEnd, editActualEnd)
        : "",
    };

    const updated = await updateEntry(updatedItem);
    setEntries(updated);
    setEditingId(null); // Bearbeitungsmodus beenden
  };

  // Einzelnen Eintrag mit Bestätigung löschen
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Eintrag löschen",
      "Willst du diesen Eintrag wirklich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
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

  // Alle Einträge mit Bestätigung löschen
  const handleClear = async () => {
    Alert.alert("Alle löschen", "Willst du wirklich alle Einträge löschen?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen",
        style: "destructive",
        onPress: async () => {
          await clearEntries();
          refresh(); // Liste nach dem Löschen aktualisieren
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Status-Badge ── */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Verlauf & Übersicht</Text>
        </View>

        <Text style={styles.title}>Deine Zeit{"\n"}im Blick.</Text>
        <Text style={styles.subtitle}>
          Sieh deine letzten Einträge, bearbeite Tage und behalte deine Woche
          schnell im Überblick.
        </Text>

        {/* ── Wochenübersicht-Karte ── */}
        <WeeklySummaryCard
          weeklyEntriesCount={weeklyEntries.length}
          weeklyWorked={formatMinutesToHHMM(weeklyWorkedMinutes)}
          // Vorzeichen manuell hinzufügen da formatMinutesToHHMM nur "-" kennt
          weeklyDiff={`${weeklyDiffMinutes > 0 ? "+" : ""}${formatMinutesToHHMM(weeklyDiffMinutes)}`}
          // Farbe je nach Über- (+), Unter- (-) oder Normallage (0)
          weeklyDiffColor={
            weeklyDiffMinutes > 0
              ? Colors.success
              : weeklyDiffMinutes < 0
                ? Colors.danger
                : Colors.textMuted
          }
        />

        {/* ── Alle löschen Button ── */}
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.clearButtonText}>Alle Einträge löschen</Text>
        </Pressable>

        {/* ── Eintrags-Liste oder Leer-Zustand ── */}
        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Noch keine Einträge</Text>
            <Text style={styles.emptyText}>
              Sobald du Tage speicherst, erscheinen sie hier.
            </Text>
          </View>
        ) : (
          <>
            {/* Drei Sektionen: diese Woche / letzte Woche / älter */}
            <HistorySection
              title="Diese Woche"
              items={groupedEntries.thisWeek}
              editingId={editingId}
              editStartTime={editStartTime}
              editPause={editPause}
              editActualEnd={editActualEnd}
              setEditStartTime={setEditStartTime}
              setEditPause={setEditPause}
              setEditActualEnd={setEditActualEnd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingId(null)}
              formatDate={formatDate}
              calculateWorkedHours={calculateWorkedHours}
            />

            <HistorySection
              title="Letzte Woche"
              items={groupedEntries.lastWeek}
              editingId={editingId}
              editStartTime={editStartTime}
              editPause={editPause}
              editActualEnd={editActualEnd}
              setEditStartTime={setEditStartTime}
              setEditPause={setEditPause}
              setEditActualEnd={setEditActualEnd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingId(null)}
              formatDate={formatDate}
              calculateWorkedHours={calculateWorkedHours}
            />

            <HistorySection
              title="Älter"
              items={groupedEntries.older}
              editingId={editingId}
              editStartTime={editStartTime}
              editPause={editPause}
              editActualEnd={editActualEnd}
              setEditStartTime={setEditStartTime}
              setEditPause={setEditPause}
              setEditActualEnd={setEditActualEnd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingId(null)}
              formatDate={formatDate}
              calculateWorkedHours={calculateWorkedHours}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 10,
    paddingBottom: 28,
  },

  // Status-Badge oben links
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    marginBottom: 20,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    color: Colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  title: {
    ...Typography.title,
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.textSoft,
    marginBottom: 22,
    maxWidth: 340,
  },

  // Dezenter Sekundär-Button für destruktive Aktion
  clearButton: {
    backgroundColor: Colors.card2,
    borderRadius: 20,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  clearButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  // Leer-Zustand wenn noch keine Einträge vorhanden
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radiusBig,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: Colors.textSoft,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Press-Feedback: leichtes Eindrücken + Abdunkeln
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
