import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LabeledInput from "../../components/LabeledInput";
import ResultCard from "../../components/ResultCard";
import { addEntry, loadEntries, WorkEntry } from "../../storage/workEntries";
import { formatHHMM, parseHHMM } from "../../utils/time";

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("30");
  const [hours, setHours] = useState("8");
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [actualEnd, setActualEnd] = useState("");
  const [endTime, setEndTime] = useState("");
  const [diff, setDiff] = useState("");

  // ✅ HIER laden (nicht oben im File!)
  useEffect(() => {
    (async () => {
      try {
        const list = await loadEntries();
        console.log("📦 loaded entries:", list.length);
        setEntries(list);
      } catch (e) {
        console.log("LOAD ERROR:", e);
      }
    })();
  }, []);

  const handleCalculate = () => {
    const start = parseHHMM(startTime);
    const pauseMin = Number((pause || "").replace(",", "."));
    const workMin = Number((hours || "").replace(",", ".")) * 60;

    if (
      start === null ||
      !Number.isFinite(pauseMin) ||
      !Number.isFinite(workMin)
    ) {
      setEndTime("");
      setDiff("");
      return;
    }

    const planned = formatHHMM(
      start + Math.round(pauseMin) + Math.round(workMin),
    );
    setEndTime(planned);

    // diff nur wenn actualEnd gültig ist
    const actual = parseHHMM(actualEnd);
    if (actual !== null) {
      const plannedMin = parseHHMM(planned)!;
      const d = actual - plannedMin; // Minuten
      const sign = d >= 0 ? "+" : "-";
      const abs = Math.abs(d);
      const hh = String(Math.floor(abs / 60)).padStart(2, "0");
      const mm = String(abs % 60).padStart(2, "0");
      setDiff(`${sign}${hh}:${mm}`);
    } else {
      setDiff("");
    }
  };

  const handleSave = async () => {
    try {
      if (!endTime) {
        Alert.alert("Hinweis", "Bitte zuerst berechnen.");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      await addEntry({
        id: String(Date.now()),
        date: today,
        startTime,
        pause,
        hours,
        plannedEnd: endTime,
        actualEnd: actualEnd.trim() ? actualEnd : undefined,
        diff: diff.trim() ? diff : undefined,
      });
      const updated = await loadEntries();
      setEntries(updated);

      Alert.alert("Gespeichert", "Eintrag wurde gespeichert ✅");
    } catch (e) {
      console.log("SAVE ERROR:", e);
      Alert.alert("Fehler", "Konnte nicht speichern.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040303" }}>
      <ScrollView style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
          Arbeitszeit Rechner
        </Text>

        <View
          style={{
            marginTop: 18,
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 18,
            gap: 16,
          }}
        >
          <LabeledInput
            label="Startzeit (HH:MM)"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="08:30"
            keyboardType="numbers-and-punctuation"
          />

          <LabeledInput
            label="Pause (Minuten)"
            value={pause}
            onChangeText={setPause}
            placeholder="30"
            keyboardType="number-pad"
          />

          <LabeledInput
            label="Zielstunden"
            value={hours}
            onChangeText={setHours}
            placeholder="8 oder 8,5"
            keyboardType="numbers-and-punctuation"
          />

          <LabeledInput
            label="Tatsächliche Endzeit (optional)"
            value={actualEnd}
            onChangeText={setActualEnd}
            placeholder="z.B. 17:10"
            keyboardType="numbers-and-punctuation"
          />

          <Pressable
            onPress={handleCalculate}
            style={({ pressed }) => ({
              marginTop: 8,
              backgroundColor: "#000",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              opacity: pressed ? 0.6 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              Berechnen
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              backgroundColor: "#1f7a1f",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              opacity: pressed ? 0.6 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              Speichern
            </Text>
          </Pressable>
        </View>

        <ResultCard endTime={endTime} actualEnd={actualEnd} diff={diff} />
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "800", marginBottom: 10 }}>
            Letzte Einträge:
          </Text>

          {entries.slice(0, 5).map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#1e1e1e",
                padding: 12,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {item.date}
              </Text>

              <Text style={{ color: "#ccc" }}>
                {item.startTime} → {item.plannedEnd}
              </Text>

              {!!item.diff && (
                <Text
                  style={{
                    color: item.diff.startsWith("+")
                      ? "#16a34a"
                      : item.diff.startsWith("-")
                        ? "#dc2626"
                        : "#6b7280",
                    fontWeight: "800",
                  }}
                >
                  {item.diff}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
