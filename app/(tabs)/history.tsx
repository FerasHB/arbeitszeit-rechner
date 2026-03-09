import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearEntries,
  loadEntries,
  WorkEntry,
} from "../../storage/workEntries";

export default function HistoryScreen() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);

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
            entries.map((item) => (
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
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                >
                  {formatDate(item.date)}
                </Text>

                <Text style={{ color: "#d1d5db", fontSize: 15 }}>
                  Start: {item.startTime}
                </Text>

                <Text style={{ color: "#d1d5db", fontSize: 15, marginTop: 2 }}>
                  Ende: {item.actualEnd || item.plannedEnd}
                </Text>

                <Text style={{ color: "#d1d5db", fontSize: 15, marginTop: 2 }}>
                  Pause: {item.pause} Min.
                </Text>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "700",
                    marginTop: 8,
                  }}
                >
                  Gearbeitet:{" "}
                  {calculateWorkedHours(
                    item.startTime,
                    item.actualEnd,
                    item.pause,
                  )}{" "}
                  h
                </Text>

                {!!item.diff && (
                  <Text
                    style={{
                      marginTop: 8,
                      color: item.diff.startsWith("+")
                        ? "#16a34a"
                        : item.diff.startsWith("-")
                          ? "#dc2626"
                          : "#6b7280",
                      fontWeight: "900",
                      fontSize: 15,
                    }}
                  >
                    Differenz: {item.diff}
                  </Text>
                )}
              </View>
            ))
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
