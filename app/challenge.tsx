import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground, CozyCard, TinyPill } from '@/components/recharge-ui';
import { CHALLENGES } from '@/constants/challenges';
import type { MaterialIconName } from '@/constants/challenges';
import { palette } from '@/constants/recharge-theme';
import { useChallengeStore } from '@/store/challengeStore';
import { getTodayString } from '@/store/userStore';

const CATEGORY_LABELS: Record<string, string> = {
  physical_home: 'Physical home',
  creative: 'Creative',
  nourish: 'Nourish',
  express: 'Express',
  move: 'Move',
  screen_detox: 'Screen detox',
};

const PROOF_ICONS: Record<string, MaterialIconName> = {
  photo_before_after: 'photo-camera',
  photo: 'photo-camera',
  audio: 'mic',
  timer: 'timer',
  steps: 'directions-walk',
};

const PROOF_LABELS: Record<string, string> = {
  photo_before_after: 'Before + after photo',
  photo: 'Single photo',
  audio: 'Audio recording',
  timer: 'Timer completion',
  steps: 'Step count',
};

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenge = CHALLENGES.find((c) => c.id === id);

  const completions = useChallengeStore((s) => s.completions);
  const inProgress = useChallengeStore((s) => (id ? s.inProgress[id] : undefined));

  const today = getTodayString();
  const done = completions.some((c) => c.challengeId === id && c.date === today);
  const hasProgress =
    inProgress?.startedDate === today &&
    (inProgress.moodBefore !== null ||
      inProgress.proofUri !== undefined ||
      inProgress.timerCompleted);

  // Mark as started as soon as the user opens the detail screen
  useEffect(() => {
    if (id && !done) {
      useChallengeStore.getState().startInProgress(id);
    }
  }, [id, done]);

  if (!challenge) {
    return (
      <AppBackground>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Challenge not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <MaterialIcons color={palette.ember} name="arrow-back" size={18} />
          <Text style={styles.backLink}>Back to today</Text>
        </Pressable>

        <CozyCard style={[styles.heroCard, { backgroundColor: palette[challenge.colorKey] }]}>
          <TinyPill label={CATEGORY_LABELS[challenge.category] ?? challenge.category} tone="moss" />
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.body}>{challenge.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <MaterialIcons name="schedule" size={16} color={palette.ink} />
              <Text style={styles.metaText}>{challenge.duration}</Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialIcons
                name={PROOF_ICONS[challenge.proofType] ?? 'photo-camera'}
                size={16}
                color={palette.ink}
              />
              <Text style={styles.metaText}>{PROOF_LABELS[challenge.proofType] ?? challenge.proofType}</Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialIcons name="local-florist" size={16} color={palette.ink} />
              <Text style={styles.metaText}>{challenge.petals} petals</Text>
            </View>
          </View>
        </CozyCard>

        <CozyCard>
          <Text style={styles.sectionTitle}>How it works</Text>
          {challenge.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </CozyCard>

        <CozyCard style={styles.kindCard}>
          <MaterialIcons color={palette.ember} name="favorite-border" size={20} />
          <Text style={styles.kindText}>{challenge.gentleNote}</Text>
        </CozyCard>

        {done ? (
          <View style={styles.doneButton}>
            <MaterialIcons color={palette.paper} name="check-circle" size={22} />
            <Text style={styles.doneButtonText}>Done for today</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.ctaButton, hasProgress && styles.ctaButtonContinue]}
            onPress={() => router.push(`/check-in?challengeId=${challenge.id}`)}>
            {hasProgress && (
              <MaterialIcons color={palette.paper} name="play-arrow" size={20} />
            )}
            <Text style={styles.ctaText}>
              {hasProgress ? 'Continue where you left off' : 'Start proof check-in'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 40,
    gap: 18,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLink: {
    color: palette.ember,
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    gap: 14,
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  body: {
    color: palette.inkSoft,
    fontSize: 15,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: palette.paper,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 12,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: palette.blush,
    color: palette.ink,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    paddingTop: 5,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  kindCard: {
    backgroundColor: palette.mist,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  kindText: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  ctaButton: {
    borderRadius: 22,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaButtonContinue: {
    backgroundColor: palette.ember,
  },
  ctaText: {
    color: palette.paper,
    fontSize: 16,
    fontWeight: '700',
  },
  doneButton: {
    borderRadius: 22,
    backgroundColor: palette.moss,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  doneButtonText: {
    color: palette.paper,
    fontSize: 16,
    fontWeight: '700',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    color: palette.ink,
    fontSize: 18,
  },
});
