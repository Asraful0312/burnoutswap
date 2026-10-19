import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppBackground, CozyCard, MascotBuddy } from "@/components/recharge-ui";
import type { BurnoutType } from "@/constants/challenges";
import { BURNOUT_TYPES } from "@/constants/challenges";
import { palette } from "@/constants/recharge-theme";
import { useUserStore } from "@/store/userStore";

const ENERGY_OPTIONS = [
  { value: 20, label: "Completely flat", emoji: "😶" },
  { value: 35, label: "Pretty drained", emoji: "😔" },
  { value: 50, label: "Surviving", emoji: "😐" },
  { value: 65, label: "A little spark", emoji: "🙂" },
  { value: 80, label: "Okay-ish", emoji: "😊" },
];

const BURNOUT_ORDER: BurnoutType[] = [
  "doomscroll",
  "creative_fog",
  "social_battery",
];

const STEP_COPY = [
  {
    title: "Let's figure out what kind of tired you are.",
    body: "One honest answer is all it takes.",
  },
  {
    title: "Which type of tired fits right now?",
    body: "No wrong answer. You can always change this later.",
  },
  {
    title: "Here's what we're working with.",
    body: "Ember's ready when you are.",
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [energyIndex, setEnergyIndex] = useState<number | null>(null);
  const [burnoutType, setBurnoutType] = useState<BurnoutType | null>(null);

  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / 3,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [step]);

  function navigateTo(newStep: 0 | 1 | 2, _direction?: "forward" | "back") {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setStep(newStep);
  }

  function selectEnergy(i: number) {
    setEnergyIndex(i);
    autoAdvanceTimer.current = setTimeout(() => navigateTo(1, "forward"), 420);
  }

  function selectBurnout(type: BurnoutType) {
    setBurnoutType(type);
    autoAdvanceTimer.current = setTimeout(() => navigateTo(2, "forward"), 420);
  }

  function handleFinish() {
    if (burnoutType === null || energyIndex === null) return;
    completeOnboarding(burnoutType, ENERGY_OPTIONS[energyIndex].value);
    router.replace("/(tabs)");
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <MascotBuddy mood="happy" size={110} animated />
          <Animated.View style={styles.heroCopy}>
            <Text style={styles.title}>{STEP_COPY[step].title}</Text>
            <Text style={styles.body}>{STEP_COPY[step].body}</Text>
          </Animated.View>
        </View>

        {/* ── Progress bar ── */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressLabel}>Step {step + 1} of 3</Text>
        </View>

        {/* ── Step content ── */}
        <View style={styles.stepWrap}>
          {/* ══ STEP 0 — energy level ══ */}
          {step === 0 && (
            <CozyCard style={styles.card}>
              <Text style={styles.question}>
                How drained does your brain feel right now?
              </Text>
              <View style={styles.optionList}>
                {ENERGY_OPTIONS.map((opt, i) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      energyIndex === i && styles.optionRowActive,
                    ]}
                    onPress={() => selectEnergy(i)}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        energyIndex === i && styles.optionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {energyIndex === i && (
                      <MaterialIcons
                        color={palette.paper}
                        name="check"
                        size={18}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[
                  styles.nextButton,
                  energyIndex === null && styles.nextButtonDisabled,
                ]}
                onPress={() => energyIndex !== null && navigateTo(1, "forward")}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <MaterialIcons
                  color={palette.paper}
                  name="arrow-forward"
                  size={18}
                />
              </Pressable>
            </CozyCard>
          )}

          {/* ══ STEP 1 — burnout type ══ */}
          {step === 1 && (
            <CozyCard style={styles.card}>
              <Text style={styles.question}>
                Which sounds most like your situation?
              </Text>
              <View style={styles.optionList}>
                {BURNOUT_ORDER.map((type) => {
                  const info = BURNOUT_TYPES[type];
                  const active = burnoutType === type;
                  return (
                    <Pressable
                      key={type}
                      style={[
                        styles.burnoutCard,
                        active && styles.burnoutCardActive,
                      ]}
                      onPress={() => selectBurnout(type)}
                    >
                      <View style={styles.burnoutCardTop}>
                        <Text
                          style={[
                            styles.burnoutTitle,
                            active && styles.burnoutTitleActive,
                          ]}
                        >
                          {info.label}
                        </Text>
                        {active ? (
                          <MaterialIcons
                            color={palette.ember}
                            name="check-circle"
                            size={20}
                          />
                        ) : (
                          <MaterialIcons
                            color={palette.line}
                            name="radio-button-unchecked"
                            size={20}
                          />
                        )}
                      </View>
                      <Text style={styles.burnoutNote}>{info.note}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.navRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigateTo(0, "back")}
                >
                  <MaterialIcons
                    color={palette.ink}
                    name="arrow-back"
                    size={18}
                  />
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.nextButton,
                    styles.nextButtonFlex,
                    burnoutType === null && styles.nextButtonDisabled,
                  ]}
                  onPress={() =>
                    burnoutType !== null && navigateTo(2, "forward")
                  }
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <MaterialIcons
                    color={palette.paper}
                    name="arrow-forward"
                    size={18}
                  />
                </Pressable>
              </View>
            </CozyCard>
          )}

          {/* ══ STEP 2 — confirmation ══ */}
          {step === 2 && burnoutType !== null && energyIndex !== null && (
            <CozyCard style={styles.card}>
              <Text style={styles.question}>
                Here's what we're working with.
              </Text>

              <View style={styles.summaryRow}>
                <View
                  style={[
                    styles.summaryChip,
                    { backgroundColor: palette.blush, flex: 1 },
                  ]}
                >
                  <Text style={styles.summaryLabel}>Pattern</Text>
                  <Text style={styles.summaryValue}>
                    {BURNOUT_TYPES[burnoutType].label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryChip,
                    { backgroundColor: palette.wheat, flex: 1 },
                  ]}
                >
                  <Text style={styles.summaryLabel}>Energy</Text>
                  <Text style={styles.summaryValue}>
                    {ENERGY_OPTIONS[energyIndex].emoji}{" "}
                    {ENERGY_OPTIONS[energyIndex].value}%
                  </Text>
                </View>
              </View>

              <View style={styles.confirmNote}>
                <MaterialIcons
                  color={palette.moss}
                  name="info-outline"
                  size={16}
                />
                <Text style={styles.confirmBody}>
                  Challenges will match your pattern. You can change this in
                  Settings any time.
                </Text>
              </View>

              <View style={styles.navRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigateTo(1, "back")}
                >
                  <MaterialIcons
                    color={palette.ink}
                    name="arrow-back"
                    size={18}
                  />
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.nextButton,
                    styles.nextButtonFlex,
                    styles.nextButtonGo,
                  ]}
                  onPress={handleFinish}
                >
                  <Text style={styles.nextButtonText}>Start my reset</Text>
                  <MaterialIcons
                    color={palette.paper}
                    name="local-fire-department"
                    size={18}
                  />
                </Pressable>
              </View>
            </CozyCard>
          )}
        </View>

        <Text style={styles.skipNote}>
          No account needed · Your data lives on your device
        </Text>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 44,
    gap: 22,
  },

  // Hero
  hero: {
    alignItems: "center",
    gap: 16,
  },
  heroCopy: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: palette.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  body: {
    color: palette.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  // Progress bar
  progressWrap: {
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.ember,
  },
  progressLabel: {
    color: palette.inkSoft,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },

  // Step wrapper
  stepWrap: {
    gap: 0,
  },
  card: {
    gap: 18,
  },
  question: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 27,
  },

  // Energy options
  optionList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionRowActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    color: palette.ink,
    fontSize: 16,
    fontWeight: "600",
  },
  optionLabelActive: {
    color: palette.paper,
  },

  // Burnout cards
  burnoutCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 6,
  },
  burnoutCardActive: {
    borderColor: palette.ember,
    backgroundColor: palette.blush,
  },
  burnoutCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  burnoutTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  burnoutTitleActive: {
    color: palette.emberDeep,
  },
  burnoutNote: {
    color: palette.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryChip: {
    padding: 16,
    borderRadius: 20,
    gap: 4,
  },
  summaryLabel: {
    color: palette.inkSoft,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  confirmNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: palette.mist,
    borderRadius: 16,
    padding: 14,
  },
  confirmBody: {
    flex: 1,
    color: palette.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },

  // Nav
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: palette.paperShade,
  },
  backButtonText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 22,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonFlex: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: palette.inkSoft,
    opacity: 0.5,
  },
  nextButtonGo: {
    backgroundColor: palette.ember,
  },
  nextButtonText: {
    color: palette.paper,
    fontSize: 16,
    fontWeight: "700",
  },

  skipNote: {
    color: palette.inkSoft,
    fontSize: 13,
    textAlign: "center",
  },
});
