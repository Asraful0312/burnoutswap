import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BurnoutType } from '@/constants/challenges';

interface UserState {
  hasCompletedOnboarding: boolean;
  burnoutType: BurnoutType | null;
  /** 0–100 */
  energyLevel: number;
  streak: number;
  /** 'YYYY-MM-DD' of the last day a challenge was completed */
  lastCompletionDate: string | null;
  totalProofs: number;
  totalRestDays: number;
  notificationEnabled: boolean;
  /** 'HH:MM' 24-hour format, e.g. '20:00' */
  notificationTime: string;

  completeOnboarding: (burnoutType: BurnoutType, energyLevel: number) => void;
  recordCompletion: (petalsEarned: number) => void;
  logRestDay: () => void;
  updateBurnoutType: (burnoutType: BurnoutType) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  resetProgress: () => void;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns positive day difference (today - date) */
export function daysSince(dateString: string): number {
  const today = new Date(getTodayString());
  const other = new Date(dateString);
  const ms = today.getTime() - other.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      burnoutType: null,
      energyLevel: 40,
      streak: 0,
      lastCompletionDate: null,
      totalProofs: 0,
      totalRestDays: 0,
      notificationEnabled: false,
      notificationTime: '20:00',

      completeOnboarding(burnoutType, energyLevel) {
        set({ hasCompletedOnboarding: true, burnoutType, energyLevel });
      },

      recordCompletion(petalsEarned) {
        const today = getTodayString();
        const { lastCompletionDate, streak, energyLevel, totalProofs } = get();

        let newStreak = streak;
        if (lastCompletionDate === null) {
          newStreak = 1;
        } else {
          const diff = daysSince(lastCompletionDate);
          if (diff === 0) {
            // already recorded today — streak unchanged
          } else if (diff === 1) {
            newStreak = streak + 1;
          } else {
            newStreak = 1;
          }
        }

        const energyGain = Math.round(petalsEarned * 0.15);
        const newEnergy = Math.min(100, energyLevel + energyGain);

        set({
          lastCompletionDate: today,
          streak: newStreak,
          energyLevel: newEnergy,
          totalProofs: totalProofs + 1,
        });
      },

      logRestDay() {
        set((s) => ({
          totalRestDays: s.totalRestDays + 1,
          lastCompletionDate: getTodayString(),
        }));
      },

      updateBurnoutType(burnoutType) {
        set({ burnoutType });
      },

      setNotificationEnabled(enabled) {
        set({ notificationEnabled: enabled });
      },

      setNotificationTime(time) {
        set({ notificationTime: time });
      },

      resetProgress() {
        set({
          hasCompletedOnboarding: false,
          burnoutType: null,
          energyLevel: 40,
          streak: 0,
          lastCompletionDate: null,
          totalProofs: 0,
          totalRestDays: 0,
          notificationEnabled: false,
          notificationTime: '20:00',
        });
      },
    }),
    {
      name: 'recharge-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
