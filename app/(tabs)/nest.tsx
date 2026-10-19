import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AppBackground,
  CozyCard,
  MascotBuddy,
  ScreenHeader,
  TinyPill,
} from "@/components/recharge-ui";
import type { MaterialIconName } from "@/constants/challenges";
import { PET_ITEMS } from "@/constants/challenges";
import { palette } from "@/constants/recharge-theme";
import { usePetStore } from "@/store/petStore";
import { useUserStore } from "@/store/userStore";

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

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "Ember just woke up. He looks a little flat but he's here.",
  2: "Ember found a warm patch of sunlight. Might stay a while.",
  3: "Ember twitched his nose. Something smells like progress.",
  4: "Ember got the cinnamon scarf on. He looks cozy and cautiously hopeful.",
  5: "Ember is reading a book. Not sure what it is. Seems engaged.",
  6: "Ember rearranged his collection of small objects with visible satisfaction.",
  7: "Ember made tea unprompted. That's new.",
  8: "Ember hummed something. Quietly. But it happened.",
  9: "Ember is genuinely well. He still has his blanket out, just in case.",
  10: "Ember is fully himself again. He says thank you in his own quiet way.",
};

export default function NestScreen() {
  const totalPetals = usePetStore((s) => s.totalPetals);
  const level = usePetStore((s) => s.level);
  const unlockedItemIds = usePetStore((s) => s.unlockedItemIds);
  const totalProofs = useUserStore((s) => s.totalProofs);

  const hasPlants = unlockedItemIds.includes("window-plants");
  const hasLamp = unlockedItemIds.includes("ceramic-lamp");
  const hasRug = unlockedItemIds.includes("cozy-rug");
  const hasLights = unlockedItemIds.includes("fairy-lights");
  const hasReadingNook = unlockedItemIds.includes("reading-nook");
  const hasSpiceShelf = unlockedItemIds.includes("spice-shelf");
  const hasBlanket = unlockedItemIds.includes("patchwork-blanket");
  const hasScarf = unlockedItemIds.includes("cinnamon-scarf");

  const nextLocked = PET_ITEMS.find(
    (item) => item.petalsRequired > 0 && !unlockedItemIds.includes(item.id),
  );
  const nextProgress = nextLocked
    ? Math.min(100, Math.round((totalPetals / nextLocked.petalsRequired) * 100))
    : 100;

  const mood = level >= 7 ? "happy" : "calm";

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Nest"
          title="Ember's recovery room"
          body="He grows calmer and cozier with every challenge you complete."
        />

        {/* ── Room scene ── */}
        <View style={styles.roomCard}>
          {/* Ceiling / top row of items */}
          <View style={styles.roomCeiling}>
            {/* Fairy lights */}
            {hasLights ? (
              <View style={styles.lightsRow}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.lightBulb,
                      {
                        backgroundColor:
                          i % 3 === 0
                            ? palette.gold
                            : i % 3 === 1
                              ? palette.ember
                              : palette.moss,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.lightsRowEmpty}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View key={i} style={styles.lightBulbEmpty} />
                ))}
              </View>
            )}
          </View>

          {/* Room floor – items + Ember */}
          <View style={styles.roomFloor}>
            {/* Left side */}
            <View style={styles.roomLeft}>
              {hasPlants && (
                <View style={styles.plantPot}>
                  <View style={styles.plantStem} />
                  <View style={styles.plantLeafL} />
                  <View style={styles.plantLeafR} />
                  <View style={styles.plantPotBody} />
                </View>
              )}
              {hasReadingNook && (
                <View style={styles.nookLight}>
                  <MaterialIcons
                    name="auto-stories"
                    size={18}
                    color={palette.gold}
                  />
                </View>
              )}
            </View>

            {/* Center — Ember */}
            <View style={styles.emberCenter}>
              {hasBlanket && (
                <View style={styles.blanketWrap}>
                  <View style={styles.blanket} />
                </View>
              )}
              <MascotBuddy mood={mood} size={110} animated />
              {hasScarf && (
                <View style={styles.scarfBadge}>
                  <MaterialIcons
                    name="checkroom"
                    size={12}
                    color={palette.paper}
                  />
                </View>
              )}
            </View>

            {/* Right side */}
            <View style={styles.roomRight}>
              {hasLamp && (
                <View style={styles.lamp}>
                  <View style={styles.lampShade} />
                  <View style={styles.lampPole} />
                  <View style={styles.lampBase} />
                  <View style={styles.lampGlow} />
                </View>
              )}
              {hasSpiceShelf && (
                <View style={styles.shelfWrap}>
                  <View style={styles.shelf}>
                    <View
                      style={[styles.jar, { backgroundColor: palette.ember }]}
                    />
                    <View
                      style={[styles.jar, { backgroundColor: palette.gold }]}
                    />
                    <View
                      style={[styles.jar, { backgroundColor: palette.moss }]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Rug */}
          {hasRug ? (
            <View style={styles.rug}>
              <View style={styles.rugInner} />
              <View style={styles.rugCenter} />
            </View>
          ) : (
            <View style={styles.rugEmpty} />
          )}

          {/* Floor line */}
          <View style={styles.floorLine} />

          {/* Level badge */}
          <View style={styles.levelRow}>
            <TinyPill
              label={`Lv ${level} · ${LEVEL_LABELS[level]}`}
              tone="gold"
            />
            <Text style={styles.levelDesc} numberOfLines={2}>
              {LEVEL_DESCRIPTIONS[level] ?? `Ember is at level ${level}.`}
            </Text>
          </View>
        </View>

        {/* ── Stats trio ── */}
        <View style={styles.statsRow}>
          <CozyCard style={styles.statCard}>
            <Text style={styles.statNum}>{totalPetals}</Text>
            <Text style={styles.statLabel}>Petals{"\n"}earned</Text>
          </CozyCard>
          <CozyCard style={styles.statCard}>
            <Text style={styles.statNum}>{unlockedItemIds.length}</Text>
            <Text style={styles.statLabel}>Cozy{"\n"}items</Text>
          </CozyCard>
          <CozyCard
            style={[styles.statCard, { backgroundColor: palette.wheat }]}
          >
            <Text style={styles.statNum}>{totalProofs}</Text>
            <Text style={styles.statLabel}>Total{"\n"}proofs</Text>
          </CozyCard>
        </View>

        {/* ── Next unlock progress ── */}
        {nextLocked && (
          <CozyCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Next unlock</Text>
              <View style={styles.nextItemBadge}>
                <MaterialIcons
                  name={nextLocked.icon as MaterialIconName}
                  size={14}
                  color={palette.ember}
                />
                <Text style={styles.progressLabel}>{nextLocked.label}</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${nextProgress}%` }]}
              />
            </View>
            <Text style={styles.progressHint}>
              {totalPetals} / {nextLocked.petalsRequired} petals ·{" "}
              {nextProgress < 100
                ? `${100 - nextProgress}% to go`
                : "Ready to unlock!"}
            </Text>
          </CozyCard>
        )}

        {/* ── Recovery room items list ── */}
        <CozyCard>
          <Text style={styles.sectionTitle}>Room items</Text>
          {PET_ITEMS.map((item) => {
            const unlocked = unlockedItemIds.includes(item.id);
            return (
              <View key={item.id} style={styles.itemRow}>
                <View
                  style={[
                    styles.itemIcon,
                    unlocked ? styles.itemIconUnlocked : styles.itemIconLocked,
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as MaterialIconName}
                    size={18}
                    color={unlocked ? palette.paper : palette.inkSoft}
                  />
                </View>
                <Text
                  style={[styles.itemText, !unlocked && styles.itemTextLocked]}
                >
                  {item.label}
                </Text>
                {unlocked ? (
                  <View style={styles.unlockedBadge}>
                    <MaterialIcons
                      name="check"
                      size={12}
                      color={palette.paper}
                    />
                    <Text style={styles.unlockedText}>In room</Text>
                  </View>
                ) : (
                  <Text style={styles.lockedText}>
                    {item.petalsRequired} petals
                  </Text>
                )}
              </View>
            );
          })}
        </CozyCard>

        {/* ── Why it works ── */}
        <CozyCard style={styles.storyCard}>
          <Text style={styles.sectionTitle}>Why Ember works</Text>
          <Text style={styles.storyText}>
            Burnout makes progress invisible. Ember turns invisible progress
            into something you can see, care about, and come back for. Every
            challenge you log is a petal in his recovery room.
          </Text>
        </CozyCard>
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

  // ── Room card ──
  roomCard: {
    borderRadius: 30,
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
    shadowColor: "#8D5E4A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  roomCeiling: {
    backgroundColor: "rgba(214,162,90,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lightsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  lightsRowEmpty: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  lightBulb: {
    width: 10,
    height: 10,
    borderRadius: 999,
    shadowColor: "#D5A24A",
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  lightBulbEmpty: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
  },
  roomFloor: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    minHeight: 180,
    backgroundColor: "rgba(246,239,231,0.5)",
  },
  roomLeft: {
    width: 64,
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  roomRight: {
    width: 64,
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  emberCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  blanketWrap: {
    position: "absolute",
    bottom: 0,
    width: 100,
    alignItems: "center",
  },
  blanket: {
    width: 100,
    height: 22,
    borderRadius: 12,
    backgroundColor: palette.blush,
    opacity: 0.7,
  },
  scarfBadge: {
    position: "absolute",
    bottom: 30,
    right: 10,
    backgroundColor: palette.ember,
    borderRadius: 999,
    padding: 4,
  },

  // Plant
  plantPot: {
    alignItems: "center",
    width: 48,
  },
  plantStem: {
    width: 3,
    height: 18,
    backgroundColor: palette.moss,
    borderRadius: 2,
  },
  plantLeafL: {
    position: "absolute",
    top: 4,
    left: 8,
    width: 14,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.moss,
    transform: [{ rotate: "-30deg" }],
  },
  plantLeafR: {
    position: "absolute",
    top: 4,
    right: 8,
    width: 14,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#5a7356",
    transform: [{ rotate: "30deg" }],
  },
  plantPotBody: {
    width: 28,
    height: 22,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: palette.clay,
    marginTop: 2,
  },

  // Lamp
  lamp: {
    alignItems: "center",
    width: 48,
    height: 80,
    justifyContent: "flex-end",
  },
  lampShade: {
    width: 32,
    height: 20,
    borderRadius: 6,
    backgroundColor: palette.wheat,
    position: "absolute",
    top: 0,
  },
  lampGlow: {
    width: 48,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(213,162,74,0.18)",
    position: "absolute",
    top: 18,
  },
  lampPole: {
    width: 4,
    height: 46,
    borderRadius: 2,
    backgroundColor: palette.inkSoft,
    position: "absolute",
    bottom: 10,
  },
  lampBase: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.inkSoft,
    position: "absolute",
    bottom: 4,
  },

  // Reading nook
  nookLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(213,162,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Spice shelf
  shelfWrap: {
    alignItems: "center",
  },
  shelf: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: palette.clay,
    borderRadius: 4,
    padding: 4,
    paddingHorizontal: 6,
  },
  jar: {
    width: 10,
    height: 14,
    borderRadius: 3,
    opacity: 0.85,
  },

  // Rug
  rug: {
    marginHorizontal: 24,
    height: 20,
    borderRadius: 12,
    backgroundColor: palette.blush,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  rugInner: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 5,
    bottom: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(196,111,79,0.3)",
  },
  rugCenter: {
    width: 30,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(196,111,79,0.2)",
  },
  rugEmpty: {
    marginHorizontal: 24,
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    marginBottom: 4,
  },
  floorLine: {
    height: 2,
    backgroundColor: "rgba(57,42,36,0.05)",
    marginHorizontal: 16,
  },
  levelRow: {
    padding: 16,
    gap: 8,
  },
  levelDesc: {
    color: palette.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 16,
  },
  statNum: {
    fontSize: 26,
    fontWeight: "800",
    color: palette.ink,
  },
  statLabel: {
    fontSize: 12,
    color: palette.inkSoft,
    textAlign: "center",
    lineHeight: 16,
  },

  // Progress
  progressCard: {
    backgroundColor: palette.wheat,
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextItemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressLabel: {
    color: palette.ember,
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: palette.paper,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.ember,
  },
  progressHint: {
    color: palette.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },

  // Items list
  sectionTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    gap: 12,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconUnlocked: {
    backgroundColor: palette.ember,
  },
  itemIconLocked: {
    backgroundColor: palette.paperShade,
  },
  itemText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  itemTextLocked: {
    color: palette.inkSoft,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: palette.moss,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unlockedText: {
    color: palette.paper,
    fontSize: 12,
    fontWeight: "700",
  },
  lockedText: {
    color: palette.inkSoft,
    fontSize: 13,
    fontWeight: "600",
  },

  // Story
  storyCard: {
    backgroundColor: palette.mist,
  },
  storyText: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 23,
  },
});
