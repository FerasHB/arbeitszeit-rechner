import React from "react";
import { Text, View } from "react-native";

type Props = {
  endTime?: string;
};

export default function ResultCard({ endTime }: Props) {
  const hasValue = !!endTime;

  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: "#111",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <Text style={{ color: "#c7c7c7", fontWeight: "700" }}>
        Endzeit
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 34,
          fontWeight: "900",
          color: "#fff",
        }}
      >
        {hasValue ? endTime : "--:--"}
      </Text>

      {!hasValue ? (
        <Text style={{ marginTop: 6, color: "#c7c7c7" }}>
          Bitte Eingaben prüfen (z.B. 08:30)
        </Text>
      ) : null}
    </View>
  );
}