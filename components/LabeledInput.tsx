import React from "react";
import { Text, TextInput, View } from "react-native";
import { Colors } from "../constants/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "numbers-and-punctuation";
  returnKeyType?: "done" | "next";
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSoft }}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        style={{
          backgroundColor: Colors.card2,
          borderRadius: 16,
          paddingVertical: 11,
          paddingHorizontal: 14,
          fontSize: 14,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      />
    </View>
  );
}
