import React from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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
  returnKeyType = "done",
}: Props) {
  const accessoryId = `acc-${label.replace(/\s+/g, "-")}`;

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#222" }}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9aa0a6"
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={Keyboard.dismiss}
        inputAccessoryViewID={Platform.OS === "ios" ? accessoryId : undefined}
        style={{
          backgroundColor: "#f5f5f5",
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 16,
          color: "#000",
        }}
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={accessoryId}>
          <View
            style={{
              backgroundColor: "#f5f5f5",
              padding: 10,
              alignItems: "flex-end",
              borderTopWidth: 1,
              borderTopColor: "#ddd",
            }}
          >
            <Pressable
              onPress={Keyboard.dismiss}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                backgroundColor: "#000",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Fertig</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}
