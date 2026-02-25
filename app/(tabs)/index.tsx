import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import LabeledInput from "../../components/LabeledInput";
import ResultCard from "../../components/ResultCard";
import { formatHHMM, parseHHMM } from "../../utils/time";

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("30");
  const [hours, setHours] = useState("8");
  const [result, setResult] = useState<string>("");

  const handleCalculate = () => {
    const start = parseHHMM(startTime);
    const pauseMin = Number((pause || "").replace(",", "."));
    const workMin = Number((hours || "").replace(",", ".")) * 60;

    if (start === null || !Number.isFinite(pauseMin) || !Number.isFinite(workMin)) {
      setResult("");
      return;
    }

    setResult(formatHHMM(start + Math.round(pauseMin) + Math.round(workMin)));
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

          <Pressable
            onPress={handleCalculate}
            style={{
              marginTop: 8,
              backgroundColor: "#000",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              Berechnen
            </Text>
          </Pressable>
        </View>

        <ResultCard endTime={result} />
      </View>
    </SafeAreaView>
  );
}