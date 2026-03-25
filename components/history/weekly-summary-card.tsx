import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Layout } from "../../constants/theme";

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
      <Text style={styles.title}>Diese Woche</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Einträge</Text>
        <Text style={styles.value}>{weeklyEntriesCount}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Gearbeitet</Text>
        <Text style={styles.value}>{weeklyWorked} h</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Überstunden</Text>
        <Text style={[styles.value, { color: weeklyDiffColor }]}>
          {weeklyDiff}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radiusBig,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 14,
    gap: 10,
  },
  title: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: Colors.textSoft,
    fontSize: 14,
  },
  value: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
