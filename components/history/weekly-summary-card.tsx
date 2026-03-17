import React from "react";
import { Text, View } from "react-native";

type Props = {
  weeklyEntriesCount: number;
  weeklyWorked: string;
  weeklyDiff: string;
  weeklyDiffColor: string;
};

export default function WeeklySummaryCard({
  weeklyEntriesCount,
  weeklyWorked,
  weeklyDiff,
  weeklyDiffColor,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#2a2a2a",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "900",
          marginBottom: 10,
        }}
      >
        Diese Woche
      </Text>

      <Text style={{ color: "#d1d5db", fontSize: 14 }}>
        Einträge: {weeklyEntriesCount}
      </Text>

      <Text style={{ color: "#d1d5db", fontSize: 14, marginTop: 4 }}>
        Gearbeitet: {weeklyWorked} h
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "800",
          marginTop: 4,
          color: weeklyDiffColor,
        }}
      >
        Überstunden: {weeklyDiff}
      </Text>
    </View>
  );
}
