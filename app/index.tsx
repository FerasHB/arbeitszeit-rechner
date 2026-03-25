import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#050608",
  card: "#0F1115",
  card2: "#141821",
  border: "#1E2430",
  text: "#F5F7FA",
  textSoft: "#9AA4B2",
  textMuted: "#5B6470",
  accent: "#F4B544",
  accentSoft: "rgba(244,181,68,0.18)",
  accentGlow: "rgba(244,181,68,0.35)",
  green: "#22C55E",
};

function useAV(initial: number) {
  return useRef(new Animated.Value(initial)).current;
}

function FloatingOrb({
  size,
  top,
  left,
  delay = 0,
}: {
  size: number;
  top: number;
  left: number;
  delay?: number;
}) {
  const translateY = useAV(0);
  const opacity = useAV(0.35);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 2200,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 2200,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

function Metric({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  const anim = useAV(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        styles.metricCard,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Animated.View>
  );
}

function StartButton({
  onPress,
  visibleAnim,
}: {
  onPress: () => void;
  visibleAnim: Animated.Value;
}) {
  const pressScale = useAV(1);
  const glow = useAV(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [glow]);

  const glowShadow = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 16],
  });

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.965,
      useNativeDriver: true,
      speed: 55,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 38,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: visibleAnim,
        transform: [
          { scale: pressScale },
          {
            translateY: visibleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
      }}
    >
      <Animated.View
        style={[
          styles.ctaOuter,
          {
            shadowRadius: glowShadow as unknown as number,
          },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.ctaButton}
        >
          <View style={styles.ctaBadge} />
          <Text style={styles.ctaText}>Jetzt starten</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function StartScreen() {
  const badgeAnim = useAV(0);
  const titleAnim = useAV(0);
  const subAnim = useAV(0);
  const cardsAnim = useAV(0);
  const ctaAnim = useAV(0);
  const footerAnim = useAV(0);
  const screenFade = useAV(1);
  const screenScale = useAV(1);
  const screenTranslate = useAV(0);
  const isNavigating = useRef(false);

  useEffect(() => {
    const run = (value: Animated.Value, delay: number, duration = 520) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

    Animated.parallel([
      run(badgeAnim, 80, 380),
      run(titleAnim, 180, 520),
      run(subAnim, 280, 500),
      run(cardsAnim, 380, 540),
      run(ctaAnim, 480, 520),
      run(footerAnim, 620, 400),
    ]).start();
  }, [badgeAnim, cardsAnim, ctaAnim, footerAnim, subAnim, titleAnim]);

  const handleStart = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(screenScale, {
        toValue: 0.98,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslate, {
        toValue: 12,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(tabs)/home" as any);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Animated.View
        style={{
          flex: 1,
          opacity: screenFade,
          transform: [{ scale: screenScale }, { translateY: screenTranslate }],
        }}
      >
        <FloatingOrb size={180} top={90} left={-40} delay={0} />
        <FloatingOrb size={130} top={340} left={260} delay={400} />
        <FloatingOrb size={110} top={560} left={20} delay={700} />

        <View style={styles.inner}>
          <Animated.View
            style={[
              styles.badgeRow,
              {
                opacity: badgeAnim,
                transform: [
                  {
                    translateY: badgeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Arbeitszeit intelligent</Text>
            </View>
            <Text style={styles.version}>v1.0</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.title}>Zeit, die sich{"\n"}klar anfühlt.</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subAnim,
                transform: [
                  {
                    translateY: subAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Endzeit berechnen, Arbeitszeit erfassen und Unterschiede sofort
            sehen — schnell, sauber und ohne unnötigen Aufwand.
          </Animated.Text>

          <Animated.View
            style={[
              styles.highlightCard,
              {
                opacity: cardsAnim,
                transform: [
                  {
                    translateY: cardsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.highlightEyebrow}>Schneller Überblick</Text>

            <View style={styles.metricsRow}>
              <Metric label="Endzeit" value="08:30 → 17:00" delay={460} />
              <Metric label="Dauer" value="08:00 h" delay={540} />
              <Metric label="Differenz" value="+00:15" delay={620} />
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  Pause und Zielstunden flexibel
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  History mit Übersicht und Bearbeiten
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>
                  Schnell genug für den Alltag
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={{ flex: 1 }} />

          <StartButton onPress={handleStart} visibleAnim={ctaAnim} />

          <Animated.Text
            style={[
              styles.footerText,
              {
                opacity: footerAnim,
              },
            ]}
          >
            Keine Werbung · Offline nutzbar · Direkt startklar
          </Animated.Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 22,
  },

  orb: {
    position: "absolute",
    backgroundColor: C.accentSoft,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: C.accent,
  },
  badgeText: {
    color: C.textSoft,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  version: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },

  title: {
    color: C.text,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1.3,
    marginBottom: 14,
  },
  subtitle: {
    color: C.textSoft,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 26,
    maxWidth: 340,
  },

  highlightCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 18,
  },
  highlightEyebrow: {
    color: C.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 14,
  },

  metricsRow: {
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  metricValue: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  metricLabel: {
    color: C.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },

  featureList: {
    gap: 10,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureBullet: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: C.green,
  },
  featureText: {
    color: C.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },

  ctaOuter: {
    shadowColor: C.accentGlow,
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: C.accent,
    borderRadius: 22,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  ctaBadge: {
    position: "absolute",
    left: 18,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#111",
    opacity: 0.45,
  },
  ctaText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  ctaArrow: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
    marginTop: -1,
  },

  footerText: {
    color: C.textMuted,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
