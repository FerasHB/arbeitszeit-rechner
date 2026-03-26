import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

type Props = {
  title: string;
  entryCount: number;
  worked: string;
  diff: string;
  diffColor: string;
};

export default function WeeklySummaryCard({
  title,
  entryCount,
  worked,
  diff,
  diffColor,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.mainValue}>{worked} h</Text>

      <View style={styles.row}>
        <Text style={styles.metaText}>{entryCount} Einträge</Text>
        <Text style={[styles.metaText, { color: diffColor }]}>{diff}</Text>
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
    textTransform: "capitalize",
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
