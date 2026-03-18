import React from "react";
import { Text, View } from "react-native";

type Props = {
  endTime?: string; // Soll-Endzeit
  actualEnd?: string; // Eingabe
  diff?: string; // "+00:10" oder "-00:20" oder "±00:00"
};

export default function ResultCard({ endTime, actualEnd, diff }: Props) {
  const showDiff = Boolean(actualEnd?.trim()) && Boolean(diff?.trim());

  // Farbe bestimmen anhand von diff
  // + => grün, - => rot, sonst grau
  const diffColor = !diff
    ? "#6b7280"
    : diff.trim().startsWith("+")
      ? "#16a34a"
      : diff.trim().startsWith("-")
        ? "#dc2626"
        : "#6b7280";

  return (
    <View
      style={{
        marginTop: 14,
        backgroundColor: "#111111",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1f1f1f",
      }}
    >
      <Text style={{ color: "#9aa0a6", fontWeight: "700" }}>Soll-Endzeit</Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 30,
          fontWeight: "900",
          color: "#fff",
        }}
      >
        {endTime || "--:--"}
      </Text>

      {showDiff && (
        <View style={{ marginTop: 8, alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#555", fontWeight: "700" }}>
            Tatsächlich: {actualEnd}
          </Text>

          <Text style={{ fontSize: 15, fontWeight: "900", color: diffColor }}>
            Differenz: {diff}
          </Text>
        </View>
      )}
    </View>
  );
}
