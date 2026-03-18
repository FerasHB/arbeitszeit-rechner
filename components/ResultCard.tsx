import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type Props = {
  endTime?: string;
  actualEnd?: string;
  diff?: string;
};

export default function ResultCard({ endTime, actualEnd, diff }: Props) {
  const showDiff = Boolean(actualEnd?.trim()) && Boolean(diff?.trim());

  const diffColor = !diff
    ? "#6b7280"
    : diff.startsWith("+")
      ? "#16a34a"
      : diff.startsWith("-")
        ? "#dc2626"
        : "#6b7280";

  const flashColor = diff?.startsWith("+")
    ? "rgba(22,163,74,0.25)"
    : diff?.startsWith("-")
      ? "rgba(220,38,38,0.25)"
      : "#111111";

  const flashAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(12)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const animatedBackground = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#111111", flashColor],
  });
  useEffect(() => {
    if (!endTime) return;

    fadeAnim.setValue(0);
    translateAnim.setValue(12);
    scaleAnim.setValue(0.98);
    flashAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // 👉 Flash nur wenn diff vorhanden
    if (diff && (diff.startsWith("+") || diff.startsWith("-"))) {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [endTime, diff]);

  return (
    <Animated.View
      style={{
        marginTop: 12,
        opacity: fadeAnim,
        transform: [{ translateY: translateAnim }, { scale: scaleAnim }],
      }}
    >
      <Animated.View
        style={{
          backgroundColor: "#111111",
          borderRadius: 24,
          padding: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#1f1f1f",
        }}
      >
        <Text style={{ color: "#9aa0a6", fontWeight: "700" }}>
          Soll-Endzeit
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 30,
            fontWeight: "900",
            color: "#fff",
          }}
        >
          {endTime || "--:--"}
        </Text>

        {showDiff && (
          <View style={{ marginTop: 12, alignItems: "center", gap: 6 }}>
            <Text style={{ color: "#9aa0a6", fontWeight: "700" }}>
              Tatsächlich: {actualEnd}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "900", color: diffColor }}>
              Differenz: {diff}
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
