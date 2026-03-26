import React from "react";
import { Pressable, Text, View } from "react-native";
import { Colors } from "../constants/theme";

type Props = {
  label: string;
  valueLabel: string;
  onPress: () => void;
};

export default function AppPickerField({ label, valueLabel, onPress }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSoft }}>
        {label}
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: Colors.card2,
          borderRadius: 16,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: Colors.border,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: Colors.text, fontSize: 14 }}>{valueLabel}</Text>
      </Pressable>
    </View>
  );
}
