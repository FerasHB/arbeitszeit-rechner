import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LabeledInput from "../../components/LabeledInput";
import ResultCard from "../../components/ResultCard";
import { useWorkCalculator } from "../../hooks/useWorkCalculator";
import { useWorkEntries } from "../../hooks/useWorkEntries";

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("30");
  const [hours, setHours] = useState("8");
  const [actualEnd, setActualEnd] = useState("");

  const { entries, saveEntry } = useWorkEntries();
  const { endTime, diff, calculate } = useWorkCalculator();

  const handleCalculate = () => {
    calculate(startTime, pause, hours, actualEnd);
  };

  const handleSave = async () => {
    try {
      if (!endTime) {
        Alert.alert("Hinweis", "Bitte zuerst berechnen.");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      await saveEntry({
        date: today,
        startTime,
        pause,
        hours,
        plannedEnd: endTime,
        actualEnd: actualEnd.trim() ? actualEnd : undefined,
        diff: diff.trim() ? diff : undefined,
      });

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
      </ScrollView>
    </SafeAreaView>
  );
}
