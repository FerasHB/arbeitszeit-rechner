import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  valueLabel: string;
  onPress: () => void;
};

export default function AppPickerField({ label, valueLabel, onPress }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#e5e7eb" }}>
        {label}
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: "#1a1a1a",
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: "#2a2a2a",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 15 }}>{valueLabel}</Text>
      </Pressable>
    </View>
  );
}
