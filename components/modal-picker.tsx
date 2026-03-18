import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  title: string;
  selectedValue: string;
  options: Option[];
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function ModalPicker({
  visible,
  title,
  selectedValue,
  options,
  onClose,
  onConfirm,
}: Props) {
  const [tempValue, setTempValue] = useState(selectedValue);

  useEffect(() => {
    if (visible) {
      setTempValue(selectedValue);
    }
  }, [visible, selectedValue]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#111111",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 16,
            paddingBottom: 24,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderColor: "#222",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Pressable onPress={onClose}>
              <Text style={{ color: "#9aa0a6", fontSize: 16 }}>Abbrechen</Text>
            </Pressable>

            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              {title}
            </Text>

            <Pressable onPress={() => onConfirm(tempValue)}>
              <Text
                style={{
                  color: "#16a34a",
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                Übernehmen
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#2a2a2a",
            }}
          >
            <Picker
              selectedValue={tempValue}
              onValueChange={(itemValue) => setTempValue(String(itemValue))}
              style={{
                color: "#fff",
                height: Platform.OS === "ios" ? 180 : 60,
              }}
              itemStyle={
                Platform.OS === "ios"
                  ? {
                      color: "#fff",
                      fontSize: 18,
                      height: 180,
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
      </View>
    </Modal>
  );
}
