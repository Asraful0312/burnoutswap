import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AppBackground,
  CozyCard,
  MascotBuddy,
  ScreenHeader,
  TinyPill,
} from "@/components/recharge-ui";
import type { MaterialIconName } from "@/constants/challenges";
import { CHALLENGES } from "@/constants/challenges";
import { palette } from "@/constants/recharge-theme";
import { useChallengeStore } from "@/store/challengeStore";
import { usePetStore } from "@/store/petStore";
import { useUserStore } from "@/store/userStore";

const MOOD_LABELS = ["Flat", "Foggy", "Tender", "Steadier", "Proud"];
const LEVEL_LABELS = [
  "",
  "Couch Potato",
  "First Breath",
  "Tiny Spark",
  "Human Signal",
  "Slowly Waking",
  "Coming Around",
  "Steady Ground",
  "Genuine Warmth",
  "Almost There",
  "Human Again",
];

export default function TodayScreen() {
  const burnoutType = useUserStore((s) => s.burnoutType);
  const energyLevel = useUserStore((s) => s.energyLevel);
  const streak = useUserStore((s) => s.streak);
  const totalProofs = useUserStore((s) => s.totalProofs);
  const totalRestDays = useUserStore((s) => s.totalRestDays);
  const logRestDay = useUserStore((s) => s.logRestDay);

  const petLevel = usePetStore((s) => s.level);

  const todaysChallengeIds = useChallengeStore((s) => s.todaysChallengeIds);
  const completions = useChallengeStore((s) => s.completions);
  const inProgress = useChallengeStore((s) => s.inProgress);
  const swappedTodayIds = useChallengeStore((s) => s.swappedTodayIds);

  useEffect(() => {
    // Access store action directly — avoids unstable reference in deps
    useChallengeStore.getState().refreshDailyChallenges(burnoutType);
  }, [burnoutType]);

  const today = new Date().toISOString().split("T")[0];
  const todaysCompletions = completions.filter((c) => c.date === today);
  const todaysChallenges = todaysChallengeIds
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter(Boolean) as typeof CHALLENGES;

  const completedTodayIds = new Set(
    todaysCompletions.map((c) => c.challengeId),
  );
  const completedCount = todaysChallenges.filter((c) =>
    completedTodayIds.has(c.id),
  ).length;

  // Recent insight: what mood shift was the biggest?
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 7);
  const recentCompletions = completions.filter(
    (c) => new Date(c.date) >= cutoff,
  );
  const bestMoodShift = recentCompletions.reduce(
    (best, c) => {
      const shift = c.moodAfter - c.moodBefore;
      if (shift > best.shift) {
        const ch = CHALLENGES.find((x) => x.id === c.challengeId);
        return { shift, label: ch?.title ?? "" };
      }
      return best;
    },
    { shift: -1, label: "" },
  );

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Recharge"
          title="Tiny real-life wins for low-battery days."
          body="A soft structure for burnout brains. No shame, no grindset, just proof-backed progress."
        />

        {/* ── Hero card ── */}
        <CozyCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <TinyPill
                label={`Recovery level ${petLevel} · ${LEVEL_LABELS[petLevel]}`}
                tone="rose"
              />
              <Text style={styles.heroTitle}>
                {completedCount === 0
                  ? "Today's reset is intentionally small."
                  : completedCount === todaysChallenges.length
                    ? "You finished today. Genuinely proud of you."
                    : `${completedCount} of ${todaysChallenges.length} done. Keep the pace.`}
              </Text>
              <Text style={styles.heroBody}>
                {streak > 0
                  ? `${streak}-day streak. Every proof counts.`
                  : "We picked challenges with enough momentum to help, but not enough pressure to close the app."}
              </Text>
            </View>
            <MascotBuddy
              mood={
                completedCount === todaysChallenges.length ? "happy" : "calm"
              }
              size={110}
            />
          </View>

          <View style={styles.energyRow}>
            <View>
              <Text style={styles.energyLabel}>Current energy</Text>
              <Text style={styles.energyValue}>{energyLevel}%</Text>
            </View>
            <View style={styles.energyTrack}>
              <View style={[styles.energyFill, { width: `${energyLevel}%` }]} />
            </View>
            <Text style={styles.energyHint}>
              {totalProofs > 0
                ? `${totalProofs} proofs logged total`
                : "Complete a challenge to charge up"}
            </Text>
          </View>
        </CozyCard>

        {/* ── Today's stack ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's cozy stack</Text>
          <TinyPill
            label={`${completedCount}/${todaysChallenges.length} done`}
            tone="gold"
          />
        </View>

        {todaysChallenges.map((challenge) => {
          const done = completedTodayIds.has(challenge.id);
          const session = inProgress[challenge.id];
          const isStarted =
            !done &&
            session?.startedDate === today &&
            (session.moodBefore !== null ||
              session.timerCompleted ||
              session.proofUri !== undefined);
          const canSwap = !done && !isStarted && !swappedTodayIds.includes(challenge.id);

          return (
            <View key={challenge.id}>
              <Pressable
                style={[
                  styles.challengeCard,
                  done && styles.challengeCardDone,
                  isStarted && styles.challengeCardStarted,
                ]}
                onPress={() =>
                  !done && router.push(`/challenge?id=${challenge.id}`)
                }
              >
                <View
                  style={[
                    styles.challengeIconWrap,
                    { backgroundColor: palette[challenge.colorKey] },
                    done && styles.challengeIconDone,
                  ]}
                >
                  <MaterialIcons
                    color={done ? palette.paper : palette.ink}
                    name={challenge.icon as MaterialIconName}
                    size={24}
                  />
                </View>
                <View style={styles.challengeCopy}>
                  <Text
                    style={[
                      styles.challengeTitle,
                      done && styles.challengeTitleDone,
                    ]}
                  >
                    {challenge.title}
                  </Text>
                  <Text style={styles.challengeMeta}>
                    {challenge.duration} {"·"}{" "}
                    {challenge.proofType.replace(/_/g, " ")}
                  </Text>
                  {isStarted && (
                    <View style={styles.inProgressPill}>
                      <View style={styles.inProgressDot} />
                      <Text style={styles.inProgressText}>In progress</Text>
                    </View>
                  )}
                </View>
                {done ? (
                  <MaterialIcons
                    color={palette.moss}
                    name="check-circle"
                    size={24}
                  />
                ) : isStarted ? (
                  <View style={styles.continueChip}>
                    <Text style={styles.continueChipText}>Continue</Text>
                  </View>
                ) : (
                  <MaterialIcons
                    color={palette.inkSoft}
                    name="chevron-right"
                    size={24}
                  />
                )}
              </Pressable>
              {canSwap && (
                <Pressable
                  style={styles.swapButton}
                  onPress={() =>
                    useChallengeStore.getState().swapChallenge(challenge.id, burnoutType)
                  }
                >
                  <MaterialIcons color={palette.inkSoft} name="refresh" size={14} />
                  <Text style={styles.swapText}>Not feeling this one? Swap it</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* ── Create custom challenge ── */}
        <Pressable style={styles.createButton} onPress={() => router.push('/custom-challenge')}>
          <MaterialIcons name="add-circle-outline" size={18} color={palette.ember} />
          <Text style={styles.createButtonText}>Create your own challenge</Text>
        </Pressable>

        {/* ── Info grid ── */}
        <View style={styles.grid}>
          <CozyCard style={styles.gridCard}>
            <Text style={styles.cardLabel}>Mood after last proof</Text>
            <Text style={styles.bigMetric}>
              {todaysCompletions.length > 0
                ? MOOD_LABELS[
                    todaysCompletions[todaysCompletions.length - 1].moodAfter
                  ]
                : "Not yet"}
            </Text>
            <Text style={styles.cardText}>
              {bestMoodShift.label
                ? `"${bestMoodShift.label}" gave you the biggest mood lift this week.`
                : "Complete a challenge to see your mood shift."}
            </Text>
          </CozyCard>

          <CozyCard style={styles.gridCardAccent}>
            <Text style={styles.cardLabel}>Soft phone lock</Text>
            <Text style={styles.bigMetric}>20 min</Text>
            <Text style={styles.cardText}>
              Keep Recharge open, tuck the phone face-down, and we'll guard your
              break.
            </Text>
            <Text style={styles.inlineMuted}>
              Best paired with sketching or tea.
            </Text>
          </CozyCard>
        </View>

        {/* ── Rest day ── */}
        {totalRestDays < 99 && (
          <CozyCard style={styles.restCard}>
            <Text style={styles.sectionTitle}>Too much today?</Text>
            <Text style={styles.cardText}>
              Logging a rest day is not giving up. Burnout brains need
              permission to stop. You've used {totalRestDays} rest{" "}
              {totalRestDays === 1 ? "day" : "days"} so far no streak penalty.
            </Text>
            <Pressable style={styles.restButton} onPress={logRestDay}>
              <Text style={styles.restButtonText}>Log rest day</Text>
            </Pressable>
          </CozyCard>
        )}

        {/* ── Quiet wins ── */}
        {recentCompletions.length > 0 && (
          <CozyCard>
            <Text style={styles.sectionTitle}>What's quietly working</Text>
            {recentCompletions
              .slice(-3)
              .reverse()
              .map((c) => {
                const ch = CHALLENGES.find((x) => x.id === c.challengeId);
                return (
                  <View
                    key={`${c.challengeId}-${c.date}`}
                    style={styles.insightRow}
                  >
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>
                      {ch?.title ?? c.challengeId} — mood shift{" "}
                      {c.moodAfter >= c.moodBefore ? "+" : ""}
                      {c.moodAfter - c.moodBefore} ({c.date})
                    </Text>
                  </View>
                );
              })}
          </CozyCard>
        )}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 18,
  },
  heroCard: {
    gap: 20,
  },
  heroTop: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroCopy: {
    flex: 1,
    gap: 10,
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
  },
  heroBody: {
    color: palette.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  energyRow: {
    gap: 10,
  },
  energyLabel: {
    color: palette.inkSoft,
    fontSize: 13,
  },
  energyValue: {
    color: palette.ink,
    fontSize: 34,
    fontWeight: "700",
  },
  energyTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    overflow: "hidden",
  },
  energyFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.ember,
  },
  energyHint: {
    color: palette.inkSoft,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "700",
  },
  challengeCard: {
    borderRadius: 28,
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  challengeCardDone: {
    opacity: 0.6,
  },
  challengeCardStarted: {
    borderColor: palette.ember,
    borderWidth: 1.5,
  },
  challengeIconDone: {
    backgroundColor: palette.moss,
  },
  inProgressPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  inProgressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.ember,
  },
  inProgressText: {
    color: palette.ember,
    fontSize: 11,
    fontWeight: "700",
  },
  continueChip: {
    backgroundColor: palette.ember,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  continueChipText: {
    color: palette.paper,
    fontSize: 12,
    fontWeight: "700",
  },
  challengeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeCopy: {
    flex: 1,
    gap: 3,
  },
  challengeTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  challengeTitleDone: {
    textDecorationLine: "line-through",
    color: palette.inkSoft,
  },
  challengeMeta: {
    color: palette.inkSoft,
    fontSize: 13,
  },
  grid: {
    gap: 16,
  },
  gridCard: {
    backgroundColor: palette.blush,
    gap: 8,
  },
  gridCardAccent: {
    backgroundColor: palette.wheat,
    gap: 8,
  },
  cardLabel: {
    color: palette.inkSoft,
    fontSize: 13,
    marginBottom: 4,
  },
  bigMetric: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "700",
  },
  cardText: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  inlineMuted: {
    marginTop: 6,
    color: palette.inkSoft,
    fontSize: 14,
  },
  restCard: {
    backgroundColor: palette.mist,
    gap: 10,
  },
  restButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: palette.paper,
    paddingVertical: 12,
    alignItems: "center",
  },
  restButtonText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  insightRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 12,
  },
  insightDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: palette.ember,
  },
  insightText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: -4,
    marginBottom: 2,
  },
  swapText: {
    color: palette.inkSoft,
    fontSize: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: palette.ember,
    borderStyle: 'dashed',
  },
  createButtonText: {
    color: palette.ember,
    fontSize: 14,
    fontWeight: '700',
  },
});
