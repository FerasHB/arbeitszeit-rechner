import React, { useState } from "react";
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
import AppPickerField from "../../components/AppPickerField";
import LabeledInput from "../../components/LabeledInput";
import ModalPicker from "../../components/modal-picker";
import ResultCard from "../../components/ResultCard";
import { Colors, Layout, Typography } from "../../constants/theme";
import { addEntry } from "../../storage/workEntries";
import { formatHHMM, parseHHMM } from "../../utils/time";

export default function HomeScreen() {
  const [startTime, setStartTime] = useState("08:30");
  const [pause, setPause] = useState("30");
  const [hours, setHours] = useState("8");
  const [actualEnd, setActualEnd] = useState("");
  const [endTime, setEndTime] = useState("");
  const [diff, setDiff] = useState("");

  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);

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
      Alert.alert("Hinweis", "Bitte prüfe deine Eingaben.");
      return;
    }

    const planned = formatHHMM(
      start + Math.round(pauseMin) + Math.round(workMin),
    );
    setEndTime(planned);

    const actual = parseHHMM(actualEnd);
    if (actual !== null) {
      const plannedMin = parseHHMM(planned)!;
      const d = actual - plannedMin;
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

      Alert.alert("Gespeichert", "Eintrag wurde gespeichert.");
    } catch (e) {
      console.log("SAVE ERROR:", e);
      Alert.alert("Fehler", "Konnte nicht speichern.");
    }
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
          <Text style={styles.badgeText}>Arbeitszeit Rechner</Text>
        </View>

        <Text style={styles.title}>Heute sauber{"\n"}berechnen.</Text>

        <View style={styles.formCard}>
          <LabeledInput
            label="Startzeit"
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
            label="Tatsächliche Endzeit"
            value={actualEnd}
            onChangeText={setActualEnd}
            placeholder="z. B. 17:10"
            keyboardType="numbers-and-punctuation"
          />

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Berechnen</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Speichern</Text>
            </Pressable>
          </View>
        </View>

        <ResultCard endTime={endTime} actualEnd={actualEnd} diff={diff} />
      </ScrollView>

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
    marginBottom: 22,
    maxWidth: 340,
  },

  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radiusBig,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 14,
  },

  buttonRow: {
    gap: 12,
    marginTop: 4,
  },

  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  secondaryButton: {
    backgroundColor: Colors.card2,
    borderRadius: 20,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
