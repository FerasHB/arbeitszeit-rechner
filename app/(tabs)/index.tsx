import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppPickerField from "../../components/AppPickerField";
import LabeledInput from "../../components/LabeledInput";
import ModalPicker from "../../components/modal-picker";
import ResultCard from "../../components/ResultCard";
import { useWorkCalculator } from "../../hooks/useWorkCalculator";
import { useWorkEntries } from "../../hooks/useWorkEntries";

console.log("PickerField =", AppPickerField);
console.log("ModalPicker =", ModalPicker);

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("5");
  const [hours, setHours] = useState("8");
  const [actualEnd, setActualEnd] = useState("");
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  const [startTimeModalVisible, setStartTimeModalVisible] = useState(false);
  const [actualEndModalVisible, setActualEndModalVisible] = useState(false);
  const { saveEntry } = useWorkEntries();
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
  const pauseOptions = Array.from({ length: 25 }, (_, i) => {
    const value = i * 5;
    return {
      label: `${value} Minuten`,
      value: value.toString(),
    };
  });

  const hourOptions = Array.from({ length: 13 }, (_, i) => {
    const value = 4 + i * 0.5;
    return {
      label: `${value.toFixed(1).replace(".", ",")} Stunden`,
      value: value.toString(),
    };
  });

  const timeOptions = Array.from({ length: 24 * 12 }, (_, i) => {
    const totalMinutes = i * 5;
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");

    return {
      label: `${hh}:${mm}`,
      value: `${hh}:${mm}`,
    };
  });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#040303", padding: 14 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>
          Arbeitszeit Tracker
        </Text>

        <Text style={{ color: "#9aa0a6", marginTop: 2, fontSize: 13 }}>
          Berechne deine Arbeitszeit und speichere deine Tage
        </Text>
        <View
          style={{
            marginTop: 12,
            backgroundColor: "#090303",
            borderRadius: 20,
            padding: 14,
            gap: 12,
            borderWidth: 1,
            borderColor: "#1f1f1f",
          }}
        >
          <LabeledInput
            label="Startzeit (HH:MM)"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="08:30"
            keyboardType="numbers-and-punctuation"
          />

          <AppPickerField
            label="Pause"
            valueLabel={`${pause} Minuten`}
            onPress={() => setPauseModalVisible(true)}
          />

          <AppPickerField
            label="Zielstunden"
            valueLabel={`${hours.replace(".", ",")} Stunden`}
            onPress={() => setHoursModalVisible(true)}
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
              backgroundColor: "#490808",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
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
              backgroundColor: "#166534",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              Speichern
            </Text>
          </Pressable>
        </View>

        <ResultCard endTime={endTime} actualEnd={actualEnd} diff={diff} />
      </View>
      <ModalPicker
        visible={pauseModalVisible}
        title="Pause wählen"
        selectedValue={pause}
        options={pauseOptions}
        onClose={() => setPauseModalVisible(false)}
        onConfirm={(value) => {
          setPause(value);
          setPauseModalVisible(false);
        }}
      />

      <ModalPicker
        visible={hoursModalVisible}
        title="Zielstunden wählen"
        selectedValue={hours}
        options={hourOptions}
        onClose={() => setHoursModalVisible(false)}
        onConfirm={(value) => {
          setHours(value);
          setHoursModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
