import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, Text, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
};

export default function LabeledPicker({
  label,
  selectedValue,
  onValueChange,
  options,
}: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#fafbfc" }}>
        {label}
      </Text>

      <View
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#2a2a2a",
          justifyContent: "center",
        }}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(String(itemValue))}
          style={{
            color: "#fff",
            height: Platform.OS === "ios" ? 85 : 56,
          }}
          itemStyle={
            Platform.OS === "ios"
              ? {
                  color: "#fff",
                  fontSize: 20,
                  height: 85,
                }
              : undefined
          }
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
