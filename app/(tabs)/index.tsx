import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import LabeledInput from "../../components/LabeledInput";
import ResultCard from "../../components/ResultCard";
import { formatHHMM, parseHHMM } from "../../utils/time";

function formatSignedMinutes(diffMin: number) {
  const sign = diffMin > 0 ? "+" : diffMin < 0 ? "-" : "";
  const abs = Math.abs(diffMin);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("30");
  const [hours, setHours] = useState("8");

  const [actualEnd, setActualEnd] = useState(""); // ✅ NEU

  const [endTime, setEndTime] = useState<string>(""); // Soll-Endzeit
  const [diff, setDiff] = useState<string>(""); // Differenz (+/-)

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

    const targetEndMin = start + Math.round(pauseMin) + Math.round(workMin);
    setEndTime(formatHHMM(targetEndMin));

    // ✅ Wenn "actualEnd" leer ist -> keine Differenz anzeigen
    const actual = actualEnd.trim() ? parseHHMM(actualEnd) : null;
    if (actual === null) {
      setDiff("");
      return;
    }

    // einfache Differenz (gleicher Tag). Wenn du Nachtschicht willst, sag Bescheid.
    const diffMin = actual - (targetEndMin % (24 * 60));
    setDiff(formatSignedMinutes(diffMin));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040303" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
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

          {/* ✅ NEU */}
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
              backgroundColor: pressed ? "#222" : "#000",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            {({ pressed }) => (
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {pressed ? "Berechne..." : "Berechnen"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* ✅ ResultCard bekommt jetzt mehr Infos */}
        <ResultCard endTime={endTime} actualEnd={actualEnd} diff={diff} />
      </View>
    </SafeAreaView>
  );
}
