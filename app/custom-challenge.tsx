import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppBackground, CozyCard, ScreenHeader, TinyPill } from '@/components/recharge-ui';
import type {
  BurnoutType,
  ChallengeCategory,
  MaterialIconName,
  ProofType,
} from '@/constants/challenges';
import { palette } from '@/constants/recharge-theme';
import { useChallengeStore } from '@/store/challengeStore';
import { useUserStore } from '@/store/userStore';

// ── Proof type options ───────────────────────────────────────────────────────

const PROOF_OPTIONS: {
  value: ProofType;
  label: string;
  icon: MaterialIconName;
  colorKey: string;
  category: ChallengeCategory;
  challengeIcon: MaterialIconName;
}[] = [
  { value: 'photo', label: 'Photo', icon: 'photo-camera', colorKey: 'gold', category: 'creative', challengeIcon: 'photo-camera' },
  { value: 'photo_before_after', label: 'Before & after', icon: 'compare', colorKey: 'clay', category: 'physical_home', challengeIcon: 'compare' },
  { value: 'audio', label: 'Audio', icon: 'mic', colorKey: 'blush', category: 'express', challengeIcon: 'mic' },
  { value: 'timer', label: 'Timer', icon: 'timer', colorKey: 'moss', category: 'screen_detox', challengeIcon: 'timer' },
  { value: 'steps', label: 'Steps', icon: 'directions-walk', colorKey: 'wheat', category: 'move', challengeIcon: 'directions-walk' },
];

const DURATION_OPTIONS = ['5 min', '10 min', '15 min', '20 min', '30 min'];

const PETALS_BY_DURATION: Record<string, number> = {
  '5 min': 15,
  '10 min': 20,
  '15 min': 25,
  '20 min': 30,
  '30 min': 40,
};

const BURNOUT_LABELS: Record<BurnoutType, string> = {
  doomscroll: 'Doomscroll fatigue',
  creative_fog: 'Creative fog',
  social_battery: 'Social battery drain',
};

const ALL_BURNOUT_TYPES: BurnoutType[] = ['doomscroll', 'creative_fog', 'social_battery'];

const COLOR_MAP: Record<string, string> = {
  clay: palette.clay,
  moss: palette.moss,
  gold: palette.gold,
  blush: palette.blush,
  wheat: palette.wheat,
  mist: palette.mist,
};

// ── Screen ───────────────────────────────────────────────────────────────────

export default function CustomChallengeScreen() {
  const [title, setTitle] = useState('');
  const [proofType, setProofType] = useState<ProofType | null>(null);
  const [duration, setDuration] = useState('10 min');
  const [burnoutTypes, setBurnoutTypes] = useState<BurnoutType[]>([]);

  const addCustomChallenge = useChallengeStore((s) => s.addCustomChallenge);
  const burnoutType = useUserStore((s) => s.burnoutType);

  const selectedProof = PROOF_OPTIONS.find((p) => p.value === proofType);
  const canSave = title.trim().length > 0 && proofType !== null && burnoutTypes.length > 0;

  function toggleBurnout(type: BurnoutType) {
    setBurnoutTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function handleSave() {
    if (!canSave || !selectedProof) return;

    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addCustomChallenge({
      id,
      title: title.trim(),
      category: selectedProof.category,
      duration,
      proofType: selectedProof.value,
      description: `A custom challenge you created.`,
      steps: [
        `Complete "${title.trim()}" in ${duration}.`,
        `Submit your ${selectedProof.label.toLowerCase()} as proof.`,
      ],
      gentleNote: 'You made this one — you know what counts.',
      petals: PETALS_BY_DURATION[duration] ?? 20,
      icon: selectedProof.challengeIcon,
      colorKey: selectedProof.colorKey as 'clay' | 'moss' | 'gold' | 'blush' | 'wheat' | 'mist',
      burnoutTypes,
    });

    // Force today's stack to refresh so the new challenge can appear
    useChallengeStore.setState({ lastDailyRefresh: null });
    useChallengeStore.getState().refreshDailyChallenges(burnoutType);

    Alert.alert(
      'Challenge created!',
      `"${title.trim()}" has been added to your pool. It may appear in tomorrow's stack or after a swap.`,
      [{ text: 'Got it', onPress: () => router.back() }]
    );
  }

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow="Create"
          title="Build your own challenge"
          body="Name it, pick how you'll prove it, and it joins your daily pool."
        />

        {/* ── Title ── */}
        <CozyCard style={styles.card}>
          <Text style={styles.label}>What's the challenge?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Organise one drawer"
            placeholderTextColor={palette.inkSoft}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            returnKeyType="done"
          />
          <Text style={styles.charCount}>{title.length}/60</Text>
        </CozyCard>

        {/* ── Proof type ── */}
        <CozyCard style={styles.card}>
          <Text style={styles.label}>How will you prove it?</Text>
          <View style={styles.proofGrid}>
            {PROOF_OPTIONS.map((opt) => {
              const active = proofType === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.proofTile,
                    { borderColor: active ? COLOR_MAP[opt.colorKey] : 'transparent' },
                    active && { backgroundColor: COLOR_MAP[opt.colorKey] + '22' },
                  ]}
                  onPress={() => setProofType(opt.value)}
                >
                  <View
                    style={[
                      styles.proofIconWrap,
                      { backgroundColor: active ? COLOR_MAP[opt.colorKey] : palette.paperShade },
                    ]}
                  >
                    <MaterialIcons
                      name={opt.icon}
                      size={20}
                      color={active ? palette.paper : palette.inkSoft}
                    />
                  </View>
                  <Text style={[styles.proofLabel, active && styles.proofLabelActive]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <MaterialIcons name="check-circle" size={14} color={COLOR_MAP[opt.colorKey]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </CozyCard>

        {/* ── Duration ── */}
        <CozyCard style={styles.card}>
          <Text style={styles.label}>How long?</Text>
          <View style={styles.pillRow}>
            {DURATION_OPTIONS.map((d) => (
              <Pressable
                key={d}
                style={[styles.durationPill, duration === d && styles.durationPillActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.petalsHint}>
            Earns {PETALS_BY_DURATION[duration]} petals on completion
          </Text>
        </CozyCard>

        {/* ── Burnout types ── */}
        <CozyCard style={styles.card}>
          <Text style={styles.label}>Who is this for?</Text>
          <Text style={styles.sublabel}>Select all that apply</Text>
          <View style={styles.burnoutList}>
            {ALL_BURNOUT_TYPES.map((type) => {
              const active = burnoutTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.burnoutRow, active && styles.burnoutRowActive]}
                  onPress={() => toggleBurnout(type)}
                >
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <MaterialIcons name="check" size={14} color={palette.paper} />}
                  </View>
                  <Text style={[styles.burnoutLabel, active && styles.burnoutLabelActive]}>
                    {BURNOUT_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </CozyCard>

        {/* ── Preview ── */}
        {canSave && selectedProof && (
          <CozyCard style={[styles.card, styles.previewCard]}>
            <Text style={styles.previewEyebrow}>Preview</Text>
            <View style={styles.previewRow}>
              <View style={[styles.previewIcon, { backgroundColor: COLOR_MAP[selectedProof.colorKey] }]}>
                <MaterialIcons name={selectedProof.challengeIcon} size={22} color={palette.paper} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.previewTitle}>{title.trim()}</Text>
                <View style={styles.previewMeta}>
                  <TinyPill label={duration} tone="gold" />
                  <TinyPill label={selectedProof.label} tone="moss" />
                  <TinyPill label={`${PETALS_BY_DURATION[duration]} petals`} tone="rose" />
                </View>
              </View>
            </View>
          </CozyCard>
        )}

        {/* ── Save ── */}
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
        >
          <MaterialIcons name="add-circle-outline" size={20} color={palette.paper} />
          <Text style={styles.saveText}>Add to my challenges</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 16,
  },
  card: {
    gap: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  sublabel: {
    fontSize: 13,
    color: palette.inkSoft,
    marginTop: -6,
  },

  // Title input
  input: {
    backgroundColor: palette.paperShade,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.ink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  charCount: {
    fontSize: 12,
    color: palette.inkSoft,
    textAlign: 'right',
    marginTop: -6,
  },

  // Proof grid
  proofGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  proofTile: {
    width: '46%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
  },
  proofIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: palette.inkSoft,
  },
  proofLabelActive: {
    color: palette.ink,
  },

  // Duration pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationPillActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.inkSoft,
  },
  durationTextActive: {
    color: palette.paper,
  },
  petalsHint: {
    fontSize: 13,
    color: palette.inkSoft,
    marginTop: -4,
  },

  // Burnout types
  burnoutList: {
    gap: 8,
  },
  burnoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  burnoutRowActive: {
    borderColor: palette.ember,
    backgroundColor: palette.blush,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: palette.ember,
    borderColor: palette.ember,
  },
  burnoutLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.inkSoft,
  },
  burnoutLabelActive: {
    color: palette.emberDeep,
  },

  // Preview
  previewCard: {
    backgroundColor: palette.mist,
  },
  previewEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.ember,
    borderRadius: 22,
    paddingVertical: 18,
  },
  saveButtonDisabled: {
    backgroundColor: palette.inkSoft,
    opacity: 0.45,
  },
  saveText: {
    color: palette.paper,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: palette.inkSoft,
    fontSize: 15,
  },
});
