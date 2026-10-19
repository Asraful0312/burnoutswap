import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground, CozyCard, ScreenHeader, TinyPill } from '@/components/recharge-ui';
import { BURNOUT_TYPES, CHALLENGES } from '@/constants/challenges';
import { palette } from '@/constants/recharge-theme';
import { useChallengeStore } from '@/store/challengeStore';
import { getTodayString, useUserStore } from '@/store/userStore';

const MOOD_LABELS = ['Flat', 'Foggy', 'Tender', 'Steadier', 'Proud'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLOR_MAP: Record<string, string> = {
  clay: palette.clay,
  moss: palette.moss,
  gold: palette.gold,
  blush: palette.blush,
  wheat: palette.wheat,
  mist: palette.mist,
};

const PROOF_ICON: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  timer: 'timer',
  audio: 'mic',
  steps: 'directions-walk',
  photo: 'photo-camera',
  photo_before_after: 'compare',
};

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(getTodayString() + 'T00:00:00');
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = getTodayString();
  const yesterday = new Date(today + 'T00:00:00');
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yStr) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function JourneyScreen() {
  const burnoutType = useUserStore((s) => s.burnoutType);
  const streak = useUserStore((s) => s.streak);
  const totalProofs = useUserStore((s) => s.totalProofs);
  const totalRestDays = useUserStore((s) => s.totalRestDays);

  const completions = useChallengeStore((s) => s.completions);

  const today = getTodayString();
  const cutoff30 = new Date(today + 'T00:00:00');
  cutoff30.setDate(cutoff30.getDate() - 30);
  const recentCompletions = completions.filter((c) => new Date(c.date + 'T00:00:00') >= cutoff30);

  const last7 = getLast7Days();
  const datesWithActivity = new Set(completions.map((c) => c.date));

  // Energy rhythm bars
  const maxDayPetals = last7.reduce((max, date) => {
    const dayTotal = completions
      .filter((c) => c.date === date)
      .reduce((sum, c) => sum + c.petalsEarned, 0);
    return Math.max(max, dayTotal);
  }, 1);

  const rhythm = last7.map((date) => {
    const dayTotal = completions
      .filter((c) => c.date === date)
      .reduce((sum, c) => sum + c.petalsEarned, 0);
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    return { date, value: dayTotal / maxDayPetals, label: DAY_SHORT[dayOfWeek], isToday: date === today };
  });

  // Best rescue combo
  const categoryShifts: Record<string, number[]> = {};
  recentCompletions.forEach((c) => {
    const ch = CHALLENGES.find((x) => x.id === c.challengeId);
    if (!ch) return;
    if (!categoryShifts[ch.category]) categoryShifts[ch.category] = [];
    categoryShifts[ch.category].push(c.moodAfter - c.moodBefore);
  });

  const bestCategory = Object.entries(categoryShifts).sort((a, b) => {
    const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length;
    const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length;
    return avgB - avgA;
  })[0];

  const CATEGORY_COMBO: Record<string, string> = {
    physical_home: 'Tidy + tea',
    creative: 'Draw + breathe',
    nourish: 'Cook + sit',
    express: 'Voice + air',
    move: 'Walk + fresh air',
    screen_detox: 'Lock + stretch',
  };

  const bestCombo = bestCategory
    ? CATEGORY_COMBO[bestCategory[0]] ?? bestCategory[0]
    : 'Not enough data yet';

  // Stats
  const totalPetals = recentCompletions.reduce((s, c) => s + c.petalsEarned, 0);
  const moodShifts = recentCompletions.map((c) => c.moodAfter - c.moodBefore);
  const avgMoodShift =
    moodShifts.length > 0
      ? Math.round((moodShifts.reduce((s, v) => s + v, 0) / moodShifts.length) * 10) / 10
      : null;

  // Group completions by date, newest first
  const grouped: Record<string, typeof recentCompletions> = {};
  [...recentCompletions].reverse().forEach((c) => {
    if (!grouped[c.date]) grouped[c.date] = [];
    grouped[c.date].push(c);
  });
  const groupedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  const hasData = recentCompletions.length > 0;

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Journey"
          title="See the evidence that your nervous system is thawing."
          body="Instead of perfect streaks, this view tracks what actually helps your energy come back."
        />

        {/* ── 30-day arc banner ── */}
        <CozyCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerLabel}>30-day arc</Text>
              <Text style={styles.bannerTitle}>Human Again season</Text>
            </View>
            <TinyPill label={streak > 0 ? `${streak}-day streak` : 'Start today'} tone="moss" />
          </View>
          <Text style={styles.bannerBody}>
            {totalProofs > 0
              ? `${totalProofs} ${totalProofs === 1 ? 'proof' : 'proofs'} completed · ${totalRestDays} honest rest ${totalRestDays === 1 ? 'day' : 'days'} logged.`
              : 'Complete your first challenge today to start building your recovery arc.'}
          </Text>

          {/* Streak dots */}
          <View style={styles.dotRow}>
            {last7.map((date) => {
              const active = datesWithActivity.has(date);
              const isToday = date === today;
              return (
                <View key={date} style={styles.dotGroup}>
                  <View
                    style={[
                      styles.dot,
                      active && styles.dotActive,
                      isToday && !active && styles.dotToday,
                    ]}
                  />
                  <Text style={[styles.dotLabel, isToday && styles.dotLabelToday]}>
                    {DAY_SHORT[new Date(date + 'T00:00:00').getDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
        </CozyCard>

        {/* ── Summary stats ── */}
        {hasData && (
          <View style={styles.statsRow}>
            <CozyCard style={styles.statCard}>
              <Text style={styles.statNum}>{totalPetals}</Text>
              <Text style={styles.statLabel}>Petals earned</Text>
            </CozyCard>
            <CozyCard style={styles.statCard}>
              <Text style={styles.statNum}>{recentCompletions.length}</Text>
              <Text style={styles.statLabel}>Challenges done</Text>
            </CozyCard>
            <CozyCard style={[styles.statCard, { backgroundColor: palette.wheat }]}>
              <Text style={styles.statNum}>
                {avgMoodShift !== null ? (avgMoodShift >= 0 ? '+' : '') + avgMoodShift : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg mood shift</Text>
            </CozyCard>
          </View>
        )}

        {/* ── Energy rhythm chart ── */}
        <CozyCard>
          <Text style={styles.sectionTitle}>Energy rhythm</Text>
          <View style={styles.chartRow}>
            {rhythm.map((item) => (
              <View key={item.date} style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max(item.value * 100, item.value > 0 ? 15 : 5)}%` },
                      item.value === 0 && styles.barEmpty,
                      item.isToday && styles.barToday,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, item.isToday && styles.barLabelToday]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.caption}>
            {hasData
              ? 'Petals earned per day, last 7 days.'
              : 'Complete challenges to see your energy rhythm.'}
          </Text>
        </CozyCard>

        {/* ── Burnout pattern + best rescue combo ── */}
        <View style={styles.duo}>
          <CozyCard style={styles.duoCard}>
            <Text style={styles.sectionTitle}>Burnout pattern</Text>
            <Text style={styles.duoBig}>
              {burnoutType ? BURNOUT_TYPES[burnoutType].label : 'Not set yet'}
            </Text>
            <Text style={styles.caption}>
              {burnoutType
                ? BURNOUT_TYPES[burnoutType].note
                : 'Complete onboarding to see your pattern.'}
            </Text>
          </CozyCard>

          <CozyCard style={[styles.duoCard, { backgroundColor: palette.wheat }]}>
            <Text style={styles.sectionTitle}>Best rescue combo</Text>
            <Text style={styles.duoBig}>{bestCombo}</Text>
            <Text style={styles.caption}>
              {hasData
                ? 'Challenge category with your strongest mood rebound.'
                : 'Emerging from your completions over time.'}
            </Text>
          </CozyCard>
        </View>

        {/* ── Completion history ── */}
        {groupedDates.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Completion history</Text>
            {groupedDates.map((date) => (
              <View key={date} style={styles.dayGroup}>
                <Text style={styles.dayLabel}>{formatDate(date)}</Text>
                <View style={styles.dayCards}>
                  {grouped[date].map((completion) => {
                    const challenge = CHALLENGES.find((c) => c.id === completion.challengeId);
                    const colorKey = challenge?.colorKey ?? 'clay';
                    const tileColor = COLOR_MAP[colorKey] ?? palette.clay;
                    const isPhotoProof =
                      challenge?.proofType === 'photo' ||
                      challenge?.proofType === 'photo_before_after';
                    const hasPhoto = !!completion.proofUri && isPhotoProof;
                    const moodShift = completion.moodAfter - completion.moodBefore;

                    return (
                      <View key={`${completion.challengeId}-${completion.date}`} style={styles.historyCard}>
                        {/* Proof thumbnail */}
                        {hasPhoto ? (
                          <Image
                            source={{ uri: completion.proofUri }}
                            style={styles.proofThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.proofThumbIcon, { backgroundColor: tileColor }]}>
                            <MaterialIcons
                              name={challenge ? PROOF_ICON[challenge.proofType] ?? 'check-circle' : 'check-circle'}
                              size={26}
                              color={palette.paper}
                            />
                          </View>
                        )}

                        {/* Details */}
                        <View style={styles.historyDetails}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {challenge?.title ?? completion.challengeId}
                          </Text>
                          <View style={styles.historyMeta}>
                            <Text style={styles.historyMoodBefore}>
                              {MOOD_LABELS[completion.moodBefore]}
                            </Text>
                            <MaterialIcons
                              name="arrow-forward"
                              size={12}
                              color={palette.inkSoft}
                            />
                            <Text style={styles.historyMoodAfter}>
                              {MOOD_LABELS[completion.moodAfter]}
                            </Text>
                          </View>
                          <View style={styles.historyFooter}>
                            <TinyPill
                              label={`${completion.petalsEarned} petals`}
                              tone="moss"
                            />
                            {moodShift !== 0 && (
                              <Text
                                style={[
                                  styles.moodShiftBadge,
                                  { color: moodShift > 0 ? palette.moss : palette.emberDeep },
                                ]}>
                                {moodShift > 0 ? '+' : ''}{moodShift} mood
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Empty state ── */}
        {!hasData && (
          <CozyCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Your journey starts with one proof.</Text>
            <Text style={styles.emptyBody}>
              Head to Today and complete your first challenge. Your recovery data will appear here.
            </Text>
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

  // Banner
  banner: {
    backgroundColor: palette.mist,
    gap: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerLabel: {
    color: palette.inkSoft,
    fontSize: 13,
  },
  bannerTitle: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 4,
  },
  bannerBody: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },

  // Streak dots
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dotGroup: {
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(57,42,36,0.1)',
  },
  dotActive: {
    backgroundColor: palette.ember,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: palette.ember,
    backgroundColor: 'transparent',
  },
  dotLabel: {
    fontSize: 11,
    color: palette.inkSoft,
  },
  dotLabelToday: {
    color: palette.ember,
    fontWeight: '700',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.ink,
  },
  statLabel: {
    fontSize: 12,
    color: palette.inkSoft,
    textAlign: 'center',
  },

  // Chart
  sectionTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    height: 180,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    borderRadius: 999,
    justifyContent: 'flex-end',
    backgroundColor: palette.paperShade,
    padding: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: palette.ember,
    minHeight: 8,
  },
  barEmpty: {
    backgroundColor: palette.line,
  },
  barToday: {
    backgroundColor: palette.emberDeep,
  },
  barLabel: {
    color: palette.inkSoft,
    fontSize: 12,
  },
  barLabelToday: {
    color: palette.ember,
    fontWeight: '700',
  },
  caption: {
    marginTop: 10,
    color: palette.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },

  // Duo cards
  duo: {
    gap: 16,
  },
  duoCard: {
    gap: 8,
  },
  duoBig: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
  },

  // History
  historySection: {
    gap: 20,
  },
  historySectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 4,
  },
  dayGroup: {
    gap: 10,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dayCards: {
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: palette.paper,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8D5E4A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  proofThumb: {
    width: 88,
    height: 88,
  },
  proofThumbIcon: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDetails: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  historyMoodBefore: {
    fontSize: 13,
    color: palette.inkSoft,
  },
  historyMoodAfter: {
    fontSize: 13,
    color: palette.ink,
    fontWeight: '600',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  moodShiftBadge: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: palette.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
