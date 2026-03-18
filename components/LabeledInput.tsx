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
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#fcfcfc" }}>
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
          backgroundColor: "#1a1a1a",
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 14,
          fontSize: 16,
          color: "#fff",
          borderWidth: 1,
          borderColor: "#2a2a2a",
        }}
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={accessoryId}>
          <View
            style={{
              backgroundColor: "#020101",
              padding: 10,
              alignItems: "flex-end",
              borderTopWidth: 1,
              borderTopColor: "#020202",
            }}
          >
            <Pressable
              onPress={Keyboard.dismiss}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                backgroundColor: "#166534",
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
