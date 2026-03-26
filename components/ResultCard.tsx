import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { Colors, Layout } from "../constants/theme";

type Props = {
  endTime?: string;
  actualEnd?: string;
  diff?: string;
};

export default function ResultCard({ endTime, actualEnd, diff }: Props) {
  const showDiff = Boolean(actualEnd?.trim()) && Boolean(diff?.trim());

  const diffColor = !diff
    ? Colors.textMuted
    : diff.startsWith("+")
      ? Colors.success
      : diff.startsWith("-")
        ? Colors.danger
        : Colors.textMuted;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(12)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (!endTime) return;

    fadeAnim.setValue(0);
    translateAnim.setValue(12);
    scaleAnim.setValue(0.98);

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
  }, [endTime, diff, fadeAnim, translateAnim, scaleAnim]);

  return (
    <Animated.View
      style={{
        marginTop: 10,
        opacity: fadeAnim,
        transform: [{ translateY: translateAnim }, { scale: scaleAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: Colors.card,
          borderRadius: Layout.radiusBig,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 18,
          alignItems: "center",
        }}
      >
        <Text style={{ color: Colors.textSoft, fontWeight: "700" }}>
          Soll-Endzeit
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 34,
            fontWeight: "900",
            color: Colors.text,
            letterSpacing: -0.6,
          }}
        >
          {endTime || "--:--"}
        </Text>

        {showDiff && (
          <View style={{ marginTop: 14, alignItems: "center", gap: 6 }}>
            <Text style={{ color: Colors.textSoft, fontWeight: "700" }}>
              Tatsächlich: {actualEnd}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "900", color: diffColor }}>
              Differenz: {diff}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
