import React from "react";
import { Text, View } from "react-native";

type Props = {
  endTime?: string; // Soll-Endzeit
  actualEnd?: string; // Eingabe
  diff?: string; // "+00:10" oder "-00:20"
};

export default function ResultCard({ endTime, actualEnd, diff }: Props) {
  const showDiff = Boolean(actualEnd?.trim()) && Boolean(diff?.trim());

  return (
    <View
      style={{
        marginTop: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#555", fontWeight: "700" }}>Soll-Endzeit</Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 36,
          fontWeight: "900",
          color: "#000",
        }}
      >
        {endTime || "--:--"}
      </Text>

      {showDiff && (
        <View style={{ marginTop: 14, alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#555", fontWeight: "700" }}>
            Tatsächlich: {actualEnd}
          </Text>

          <Text style={{ fontSize: 18, fontWeight: "900", color: "#000" }}>
            Differenz: {diff}
          </Text>
        </View>
      )}
    </View>
  );
}
