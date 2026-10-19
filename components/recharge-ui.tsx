import { PropsWithChildren, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native";

import { palette, shadows } from "@/constants/recharge-theme";

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.page}>
      <View style={[styles.blob, styles.blobOne]} />
      <View style={[styles.blob, styles.blobTwo]} />
      <View style={[styles.blob, styles.blobThree]} />
      {children}
    </View>
  );
}

export function CozyCard({
  children,
  style,
  ...props
}: PropsWithChildren<ViewProps>) {
  return (
    <View {...props} style={[styles.card, shadows.card, style]}>
      {children}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerBody}>{body}</Text>
    </View>
  );
}

export function TinyPill({
  label,
  tone = "gold",
}: {
  label: string;
  tone?: "gold" | "rose" | "moss";
}) {
  const toneStyle =
    tone === "rose"
      ? styles.pillRose
      : tone === "moss"
        ? styles.pillMoss
        : styles.pillGold;

  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export function MascotBuddy({
  mood,
  size = 120,
  animated: enableAnim = false,
}: {
  mood: "happy" | "calm";
  size?: number;
  animated?: boolean;
}) {
  const floatY = useRef(new Animated.Value(0)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const swayX = useRef(new Animated.Value(0)).current;
  const blinkScaleY = useRef(new Animated.Value(1)).current;
  const tailRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enableAnim) return;

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.04,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayX, {
          toValue: 6,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayX, {
          toValue: -6,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayX, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    let tailLoop: Animated.CompositeAnimation | null = null;
    if (mood === "happy") {
      tailLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(tailRot, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(tailRot, {
            toValue: -1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(tailRot, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
        ]),
      );
      tailLoop.start();
    }

    floatLoop.start();
    breathLoop.start();
    swayLoop.start();

    let blinkTimer: ReturnType<typeof setTimeout>;
    const doBlink = () => {
      // Don't blink if eyes are already closed (happy arcs)
      if (mood === "happy") return;

      Animated.sequence([
        Animated.timing(blinkScaleY, {
          toValue: 0.08,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(blinkScaleY, {
          toValue: 1,
          duration: 65,
          useNativeDriver: true,
        }),
      ]).start(() => {
        blinkTimer = setTimeout(doBlink, 2200 + Math.random() * 2800);
      });
    };
    blinkTimer = setTimeout(doBlink, 1200 + Math.random() * 1000);

    return () => {
      floatLoop.stop();
      breathLoop.stop();
      swayLoop.stop();
      tailLoop?.stop();
      clearTimeout(blinkTimer);
    };
  }, [enableAnim, mood]);

  const tailRotDeg = tailRot.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-18deg", "18deg"],
  });

  return (
    <Animated.View
      style={[
        styles.mascotWrap,
        { width: size, height: size * 1.1 },
        enableAnim && {
          transform: [{ translateY: floatY }, { translateX: swayX }],
        },
      ]}
    >
      <View style={styles.sparkleOne} />
      <View style={styles.sparkleTwo} />
      <Animated.View
        style={[
          styles.body,
          { width: size, height: size * 0.8, borderRadius: size * 0.36 },
          enableAnim && { transform: [{ scale: breathScale }] },
        ]}
      >
        <View style={styles.earLeft} />
        <View style={styles.earRight} />
        <View style={styles.faceRow}>
          <Animated.View
            style={[
              styles.eye,
              mood === "happy" && styles.eyeHappy,
              enableAnim &&
                mood !== "happy" && { transform: [{ scaleY: blinkScaleY }] },
            ]}
          />
          <Animated.View
            style={[
              styles.eye,
              mood === "happy" && styles.eyeHappy,
              enableAnim &&
                mood !== "happy" && { transform: [{ scaleY: blinkScaleY }] },
            ]}
          />
        </View>
        <View
          style={[
            styles.mouth,
            mood === "happy" ? styles.mouthHappy : styles.mouthCalm,
          ]}
        />
        <View
          style={[styles.cheekLeft, mood === "happy" && styles.cheekHappy]}
        />
        <View
          style={[styles.cheekRight, mood === "happy" && styles.cheekHappy]}
        />
        <View style={styles.belly} />
        {mood === "happy" && (
          <Animated.View
            style={[
              styles.tail,
              enableAnim && { transform: [{ rotate: tailRotDeg }] },
            ]}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobOne: {
    width: 260,
    height: 260,
    top: -40,
    right: -50,
    backgroundColor: "rgba(198, 120, 92, 0.14)",
  },
  blobTwo: {
    width: 220,
    height: 220,
    top: 230,
    left: -80,
    backgroundColor: "rgba(214, 169, 90, 0.12)",
  },
  blobThree: {
    width: 300,
    height: 300,
    bottom: -80,
    right: -100,
    backgroundColor: "rgba(115, 143, 111, 0.11)",
  },
  card: {
    borderRadius: 30,
    backgroundColor: palette.paper,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  header: {
    paddingTop: 30,
    gap: 8,
  },
  eyebrow: {
    color: palette.ember,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: palette.ink,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "700",
    letterSpacing: -1,
  },
  headerBody: {
    color: palette.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 620,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillGold: {
    backgroundColor: palette.wheat,
  },
  pillRose: {
    backgroundColor: palette.blush,
  },
  pillMoss: {
    backgroundColor: palette.mist,
  },
  pillText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  mascotWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  body: {
    backgroundColor: palette.ember,
    justifyContent: "center",
    alignItems: "center",
  },
  earLeft: {
    position: "absolute",
    top: -10,
    left: 18,
    width: 22,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 8,
    backgroundColor: palette.emberDeep,
    transform: [{ rotate: "-18deg" }],
  },
  earRight: {
    position: "absolute",
    top: -8,
    right: 18,
    width: 24,
    height: 30,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 8,
    backgroundColor: palette.emberDeep,
    transform: [{ rotate: "18deg" }],
  },
  faceRow: {
    flexDirection: "row",
    gap: 22,
    marginTop: -6,
  },
  eye: {
    width: 9,
    height: 11,
    borderRadius: 999,
    backgroundColor: palette.ink,
  },
  eyeHappy: {
    width: 12,
    height: 7,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  mouth: {
    marginTop: 10,
    borderColor: palette.ink,
  },
  mouthHappy: {
    width: 14,
    height: 8,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  mouthCalm: {
    width: 18,
    height: 2,
    backgroundColor: palette.ink,
    borderRadius: 2,
  },
  cheekLeft: {
    position: "absolute",
    top: 45,
    left: 14,
    width: 16,
    height: 11,
    borderRadius: 999,
    backgroundColor: "rgba(250, 220, 204, 0.4)",
  },
  cheekRight: {
    position: "absolute",
    top: 45,
    right: 14,
    width: 16,
    height: 11,
    borderRadius: 999,
    backgroundColor: "rgba(250, 220, 204, 0.4)",
  },
  cheekHappy: {
    width: 22,
    height: 14,
    backgroundColor: "rgba(250, 220, 204, 0.7)",
  },
  belly: {
    position: "absolute",
    bottom: 10,
    width: "44%",
    height: "18%",
    borderRadius: 999,
    backgroundColor: palette.emberLight,
  },
  sparkleOne: {
    position: "absolute",
    right: 14,
    top: 10,
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: palette.gold,
    transform: [{ rotate: "18deg" }],
  },
  sparkleTwo: {
    position: "absolute",
    left: 8,
    top: 24,
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: palette.moss,
    transform: [{ rotate: "18deg" }],
  },
  tail: {
    position: "absolute",
    bottom: 12,
    right: -12,
    width: 18,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.emberDeep,
  },
});
