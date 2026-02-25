import React from "react";
import { Text, View } from "react-native";

type Props = {
  endTime?: string;
};

export default function ResultCard({ endTime }: Props) {
  return (
    <View
      style={{
        marginTop: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#555", fontWeight: "700" }}>
        Endzeit
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 36,
          fontWeight: "900",
          color: "#000",
        }}
      >
        {endTime || "--:--"}
      </Text>
    </View>
  );
}