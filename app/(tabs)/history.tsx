import { useEffect, useState } from "react";
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

  useEffect(() => {
    refresh();
  }, []);

  const handleClear = async () => {
    await clearEntries();
    refresh();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040303" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
          History
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
                  backgroundColor: "#1e1e1e",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {item.date}
                </Text>

                <Text style={{ color: "#cfcfcf" }}>
                  {item.startTime} → {item.plannedEnd}
                </Text>

                {!!item.diff && (
                  <Text
                    style={{
                      marginTop: 6,
                      color: item.diff.startsWith("+")
                        ? "#16a34a"
                        : item.diff.startsWith("-")
                          ? "#dc2626"
                          : "#6b7280",
                      fontWeight: "900",
                    }}
                  >
                    {item.diff}
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
