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

// ─── Hilfsfunktionen: Monat ──────────────────────────────────────────────────

function isSameMonth(date: Date, selected: Date) {
  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth()
  );
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

function goToPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function goToNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function isCurrentMonth(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

// ─── Hilfsfunktionen: Zeit & Minuten ─────────────────────────────────────────

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
  if (total < 0) total += 24 * 60;

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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editPause, setEditPause] = useState("");
  const [editActualEnd, setEditActualEnd] = useState("");

  const refresh = async () => {
    const list = await loadEntries();
    setEntries(list);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  const monthlyEntries = useMemo(() => {
    return entries.filter((item) => {
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return false;
      return isSameMonth(date, selectedMonth);
    });
  }, [entries, selectedMonth]);

  const monthlyWorkedMinutes = useMemo(() => {
    return monthlyEntries.reduce((sum, item) => {
      const worked = calculateWorkedHours(
        item.startTime,
        item.actualEnd,
        item.pause,
      );
      return sum + sumMinutesFromHHMM(worked);
    }, 0);
  }, [monthlyEntries]);

  const monthlyDiffMinutes = useMemo(() => {
    return monthlyEntries.reduce((sum, item) => {
      return sum + sumMinutesFromHHMM(item.diff);
    }, 0);
  }, [monthlyEntries]);

  const sortedMonthlyEntries = useMemo(() => {
    return [...monthlyEntries].sort((a, b) => b.date.localeCompare(a.date));
  }, [monthlyEntries]);

  const handleEdit = (item: WorkEntry) => {
    setEditingId(item.id);
    setEditStartTime(item.startTime);
    setEditPause(item.pause);
    setEditActualEnd(item.actualEnd || "");
  };

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

  const handleClear = async () => {
    Alert.alert("Alle löschen", "Willst du wirklich alle Einträge löschen?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen",
        style: "destructive",
        onPress: async () => {
          await clearEntries();
          refresh();
        },
      },
    ]);
  };

  const handleNextMonth = () => {
    if (isCurrentMonth(selectedMonth)) return;
    setSelectedMonth((prev) => goToNextMonth(prev));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Verlauf & Übersicht</Text>
        </View>

        <Text style={styles.title}>Deine Zeit{"\n"}im Blick.</Text>
        <Text style={styles.subtitle}>
          Wähle einen Monat, prüfe Gesamtstunden und behalte deine Einträge
          schnell im Überblick.
        </Text>

        {/* ── Monatsnavigation ── */}
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => setSelectedMonth((prev) => goToPreviousMonth(prev))}
            style={({ pressed }) => [
              styles.monthButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.monthButtonText}>←</Text>
          </Pressable>

          <Text style={styles.monthLabel}>
            {formatMonthLabel(selectedMonth)}
          </Text>

          <Pressable
            onPress={handleNextMonth}
            disabled={isCurrentMonth(selectedMonth)}
            style={({ pressed }) => [
              styles.monthButton,
              isCurrentMonth(selectedMonth) && styles.monthButtonDisabled,
              pressed && !isCurrentMonth(selectedMonth) && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.monthButtonText,
                isCurrentMonth(selectedMonth) && styles.monthButtonTextDisabled,
              ]}
            >
              →
            </Text>
          </Pressable>
        </View>

        {/* ── Monatsübersicht ── */}
        <WeeklySummaryCard
          title={formatMonthLabel(selectedMonth)}
          entryCount={monthlyEntries.length}
          worked={formatMinutesToHHMM(monthlyWorkedMinutes)}
          diff={`${monthlyDiffMinutes > 0 ? "+" : ""}${formatMinutesToHHMM(monthlyDiffMinutes)}`}
          diffColor={
            monthlyDiffMinutes > 0
              ? Colors.success
              : monthlyDiffMinutes < 0
                ? Colors.danger
                : Colors.textMuted
          }
        />

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Noch keine Einträge</Text>
            <Text style={styles.emptyText}>
              Sobald du Tage speicherst, erscheinen sie hier.
            </Text>
          </View>
        ) : monthlyEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Keine Einträge in diesem Monat
            </Text>
            <Text style={styles.emptyText}>
              Wähle einen anderen Monat oder speichere neue Tage.
            </Text>
          </View>
        ) : (
          <HistorySection
            title={formatMonthLabel(selectedMonth)}
            items={sortedMonthlyEntries}
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
    marginBottom: 18,
    maxWidth: 340,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.card2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonDisabled: {
    opacity: 0.45,
  },
  monthButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  monthButtonTextDisabled: {
    color: Colors.textMuted,
  },
  monthLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    textTransform: "capitalize",
  },

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

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
