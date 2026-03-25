import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

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
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>Monatsübersicht</Text>

      {/* Main Value (wichtigster Wert groß) */}
      <Text style={styles.mainValue}>{weeklyWorked} h</Text>

      {/* Untere Infos kompakt */}
      <View style={styles.row}>
        <Text style={styles.metaText}>{weeklyEntriesCount} Einträge</Text>

        <Text style={[styles.metaText, { color: weeklyDiffColor }]}>
          {weeklyDiff}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  title: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  mainValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaText: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },
});
