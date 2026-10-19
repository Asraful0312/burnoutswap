import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppBackground, CozyCard, ScreenHeader, TinyPill } from '@/components/recharge-ui';
import { BURNOUT_TYPES } from '@/constants/challenges';
import type { BurnoutType } from '@/constants/challenges';
import { palette } from '@/constants/recharge-theme';
import { useChallengeStore } from '@/store/challengeStore';
import { usePetStore } from '@/store/petStore';
import { useUserStore } from '@/store/userStore';
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from '@/utils/notifications';

const BURNOUT_ORDER: BurnoutType[] = ['doomscroll', 'creative_fog', 'social_battery'];

const REMINDER_TIMES = [
  { label: '7 AM', value: '07:00' },
  { label: '8 AM', value: '08:00' },
  { label: '9 AM', value: '09:00' },
  { label: '12 PM', value: '12:00' },
  { label: '6 PM', value: '18:00' },
  { label: '7 PM', value: '19:00' },
  { label: '8 PM', value: '20:00' },
  { label: '9 PM', value: '21:00' },
];

function MyCustomChallenges() {
  const customChallenges = useChallengeStore((s) => s.customChallenges);
  const removeCustomChallenge = useChallengeStore((s) => s.removeCustomChallenge);

  if (customChallenges.length === 0) return null;

  function confirmDelete(id: string, title: string) {
    Alert.alert(
      'Remove challenge?',
      `"${title}" will be removed from your pool.`,
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeCustomChallenge(id) },
      ]
    );
  }

  return (
    <CozyCard style={styles.section}>
      <Text style={styles.sectionLabel}>My challenges</Text>
      {customChallenges.map((c) => (
        <View key={c.id} style={styles.customRow}>
          <View style={styles.customInfo}>
            <Text style={styles.customTitle}>{c.title}</Text>
            <Text style={styles.customMeta}>{c.duration} · {c.proofType.replace(/_/g, ' ')}</Text>
          </View>
          <Pressable onPress={() => confirmDelete(c.id, c.title)} style={styles.deleteBtn}>
            <MaterialIcons name="delete-outline" size={20} color={palette.inkSoft} />
          </Pressable>
        </View>
      ))}
    </CozyCard>
  );
}

export default function SettingsScreen() {
  const burnoutType = useUserStore((s) => s.burnoutType);
  const energyLevel = useUserStore((s) => s.energyLevel);
  const streak = useUserStore((s) => s.streak);
  const totalProofs = useUserStore((s) => s.totalProofs);
  const totalRestDays = useUserStore((s) => s.totalRestDays);
  const notificationEnabled = useUserStore((s) => s.notificationEnabled);
  const notificationTime = useUserStore((s) => s.notificationTime);

  const updateBurnoutType = useUserStore((s) => s.updateBurnoutType);
  const setNotificationEnabled = useUserStore((s) => s.setNotificationEnabled);
  const setNotificationTime = useUserStore((s) => s.setNotificationTime);
  const resetProgress = useUserStore((s) => s.resetProgress);

  const [burnoutExpanded, setBurnoutExpanded] = useState(false);

  function handleResetProgress() {
    Alert.alert(
      'Reset all progress?',
      'This clears your energy level, streak, proofs, and pet petals. Your Ember goes back to level 1. This cannot be undone.',
      [
        { text: 'Keep my progress', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            useChallengeStore.getState().resetAll();
            usePetStore.getState().resetPet();
            router.replace('/onboarding');
          },
        },
      ]
    );
  }

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Settings"
          title="Adjust, reset, or just take a look."
          body="Everything here is local to your device until you choose to sign in."
        />

        {/* ── Recovery profile ── */}
        <CozyCard style={styles.section}>
          <Text style={styles.sectionLabel}>Your recovery profile</Text>

          <View style={styles.statRow}>
            <StatBlock label="Energy" value={`${energyLevel}%`} />
            <StatBlock label="Streak" value={`${streak}d`} />
            <StatBlock label="Proofs" value={`${totalProofs}`} />
            <StatBlock label="Rest days" value={`${totalRestDays}`} />
          </View>

          <Pressable
            style={styles.settingRow}
            onPress={() => setBurnoutExpanded((v) => !v)}>
            <View style={styles.settingLeft}>
              <MaterialIcons color={palette.ember} name="psychology" size={20} />
              <View>
                <Text style={styles.settingTitle}>Burnout pattern</Text>
                <Text style={styles.settingValue}>
                  {burnoutType ? BURNOUT_TYPES[burnoutType].label : 'Not set'}
                </Text>
              </View>
            </View>
            <MaterialIcons
              color={palette.inkSoft}
              name={burnoutExpanded ? 'expand-less' : 'expand-more'}
              size={22}
            />
          </Pressable>

          {burnoutExpanded && (
            <View style={styles.burnoutPicker}>
              {BURNOUT_ORDER.map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.burnoutOption,
                    burnoutType === type && styles.burnoutOptionActive,
                  ]}
                  onPress={() => {
                    updateBurnoutType(type);
                    setBurnoutExpanded(false);
                  }}>
                  <View style={styles.burnoutOptionTop}>
                    <Text style={styles.burnoutOptionLabel}>{BURNOUT_TYPES[type].label}</Text>
                    {burnoutType === type && (
                      <MaterialIcons color={palette.ember} name="check-circle" size={18} />
                    )}
                  </View>
                  <Text style={styles.burnoutOptionNote}>{BURNOUT_TYPES[type].note}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </CozyCard>

        {/* ── Daily reminder ── */}
        <CozyCard style={styles.section}>
          <Text style={styles.sectionLabel}>Daily reminder</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons color={palette.ember} name="notifications-none" size={20} />
              <View>
                <Text style={styles.settingTitle}>Remind me daily</Text>
                <Text style={styles.settingValue}>
                  {notificationEnabled ? `At ${formatTime(notificationTime)}` : 'Off'}
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: palette.line, true: palette.ember }}
              thumbColor={palette.paper}
              value={notificationEnabled}
              onValueChange={async (enabled) => {
                setNotificationEnabled(enabled);
                if (enabled) {
                  const granted = await scheduleDailyReminder(notificationTime);
                  if (!granted) {
                    // Permission denied — revert the toggle
                    setNotificationEnabled(false);
                    Alert.alert(
                      'Notifications blocked',
                      'Allow notifications for Recharge in your device Settings to get daily reminders.',
                      [{ text: 'OK' }]
                    );
                  }
                } else {
                  await cancelDailyReminder();
                }
              }}
            />
          </View>

          {notificationEnabled && (
            <View style={styles.timePicker}>
              <Text style={styles.timePickerLabel}>Reminder time</Text>
              <View style={styles.timeChips}>
                {REMINDER_TIMES.map((t) => (
                  <Pressable
                    key={t.value}
                    style={[
                      styles.timeChip,
                      notificationTime === t.value && styles.timeChipActive,
                    ]}
                    onPress={async () => {
                      setNotificationTime(t.value);
                      // Reschedule immediately at the new time
                      await scheduleDailyReminder(t.value);
                    }}>
                    <Text
                      style={[
                        styles.timeChipText,
                        notificationTime === t.value && styles.timeChipTextActive,
                      ]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </CozyCard>

        {/* ── Account ── */}
        <CozyCard style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons color={palette.ember} name="cloud-queue" size={20} />
              <View>
                <Text style={styles.settingTitle}>Sign in to sync</Text>
                <Text style={styles.settingValue}>Back up your progress across devices</Text>
              </View>
            </View>
            <TinyPill label="Soon" tone="gold" />
          </View>

          <View style={[styles.settingRow, styles.settingRowMuted]}>
            <View style={styles.settingLeft}>
              <MaterialIcons color={palette.inkSoft} name="lock-outline" size={20} />
              <View>
                <Text style={[styles.settingTitle, styles.mutedText]}>Export my data</Text>
                <Text style={styles.settingValue}>Download a copy of your proofs and history</Text>
              </View>
            </View>
            <TinyPill label="Soon" tone="gold" />
          </View>
        </CozyCard>

        {/* ── My challenges ── */}
        <MyCustomChallenges />

        {/* ── Danger zone ── */}
        <CozyCard style={[styles.section, styles.dangerSection]}>
          <Text style={styles.sectionLabel}>Reset</Text>

          <Pressable style={styles.settingRow} onPress={handleResetProgress}>
            <View style={styles.settingLeft}>
              <MaterialIcons color={palette.ember} name="refresh" size={20} />
              <View>
                <Text style={styles.settingTitle}>Reset all progress</Text>
                <Text style={styles.settingValue}>
                  Clears proofs, streak, petals, and energy. Returns to onboarding.
                </Text>
              </View>
            </View>
            <MaterialIcons color={palette.inkSoft} name="chevron-right" size={22} />
          </Pressable>
        </CozyCard>

        <Text style={styles.version}>Recharge · v1.0.0 · your data lives on your device</Text>
      </ScrollView>
    </AppBackground>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 18,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    color: palette.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBlock: {
    flex: 1,
    backgroundColor: palette.paperShade,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: palette.inkSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  settingRowMuted: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingValue: {
    color: palette.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  mutedText: {
    color: palette.inkSoft,
  },
  burnoutPicker: {
    gap: 10,
    paddingTop: 4,
  },
  burnoutOption: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  burnoutOptionActive: {
    borderColor: palette.ember,
    backgroundColor: palette.blush,
  },
  burnoutOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  burnoutOptionLabel: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  burnoutOptionNote: {
    color: palette.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  timePicker: {
    gap: 10,
  },
  timePickerLabel: {
    color: palette.inkSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timeChipActive: {
    backgroundColor: palette.ember,
  },
  timeChipText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  timeChipTextActive: {
    color: palette.paper,
  },
  notificationNote: {
    color: palette.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: palette.line,
  },
  version: {
    color: palette.inkSoft,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    gap: 12,
  },
  customInfo: {
    flex: 1,
    gap: 2,
  },
  customTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  customMeta: {
    fontSize: 13,
    color: palette.inkSoft,
  },
  deleteBtn: {
    padding: 6,
  },
});
