import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BurnoutType, Challenge } from '@/constants/challenges';
import { CHALLENGES } from '@/constants/challenges';
import { getTodayString } from './userStore';

export interface ChallengeCompletion {
  challengeId: string;
  date: string; // 'YYYY-MM-DD'
  proofUri?: string;
  moodBefore: number; // 0–4 index
  moodAfter: number; // 0–4 index
  petalsEarned: number;
}

/**
 * Mutable snapshot of a challenge session.
 * Persists across app restarts until the daily refresh wipes it
 * (new day = new challenge stack = stale sessions cleared).
 */
export interface ChallengeInProgress {
  startedDate: string; // 'YYYY-MM-DD'
  moodBefore: number | null;
  moodAfter: number | null;
  /** URI of the single proof photo, or the "before" photo for before/after */
  proofUri: string | undefined;
  /** URI of the "after" photo (photo_before_after proof type only) */
  photoAfterUri: string | undefined;
  timerCompleted: boolean;
}

interface ChallengeState {
  todaysChallengeIds: string[];
  lastDailyRefresh: string | null;
  completions: ChallengeCompletion[];
  /** Keyed by challengeId — one entry per actively-worked challenge session */
  inProgress: Record<string, ChallengeInProgress>;
  /** IDs swapped out today — each slot can only be refreshed once per day */
  swappedTodayIds: string[];
  /** User-created challenges merged into the daily pool */
  customChallenges: Challenge[];

  addCustomChallenge: (challenge: Challenge) => void;
  removeCustomChallenge: (id: string) => void;
  refreshDailyChallenges: (burnoutType: BurnoutType | null) => void;
  /** Replace one incomplete, not-in-progress challenge with a fresh pick. Returns false if not allowed. */
  swapChallenge: (challengeId: string, burnoutType: BurnoutType | null) => boolean;
  completeChallenge: (completion: ChallengeCompletion) => void;
  isChallengeCompletedToday: (challengeId: string) => boolean;
  /** Mark a challenge as started (idempotent for the same day) */
  startInProgress: (challengeId: string) => void;
  /** Persist partial check-in state (called on every user input) */
  updateInProgress: (
    challengeId: string,
    updates: Partial<Omit<ChallengeInProgress, 'startedDate'>>
  ) => void;
  /** Remove the in-progress entry once the challenge is completed */
  clearInProgress: (challengeId: string) => void;
  resetAll: () => void;
  getTodaysCompletions: () => ChallengeCompletion[];
  getRecentCompletions: (days: number) => ChallengeCompletion[];
}

function pickDailyChallenges(
  burnoutType: BurnoutType | null,
  recentlyCompletedIds: string[],
  allChallenges: Challenge[] = CHALLENGES
): string[] {
  const preferred = burnoutType
    ? allChallenges.filter((c) => c.burnoutTypes.includes(burnoutType))
    : allChallenges;

  const fresh = preferred.filter((c) => !recentlyCompletedIds.includes(c.id));
  const pool = fresh.length >= 3 ? fresh : allChallenges.filter((c) => !recentlyCompletedIds.includes(c.id));
  const fallback = pool.length >= 3 ? pool : allChallenges;

  const arr = [...fallback];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3).map((c) => c.id);
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      todaysChallengeIds: [],
      lastDailyRefresh: null,
      completions: [],
      inProgress: {},
      swappedTodayIds: [],
      customChallenges: [],

      addCustomChallenge(challenge) {
        set((s) => ({ customChallenges: [...s.customChallenges, challenge] }));
      },

      removeCustomChallenge(id) {
        set((s) => ({
          customChallenges: s.customChallenges.filter((c) => c.id !== id),
          todaysChallengeIds: s.todaysChallengeIds.filter((cid) => cid !== id),
        }));
      },

      refreshDailyChallenges(burnoutType) {
        const today = getTodayString();
        if (get().lastDailyRefresh === today) return;

        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const recentIds = get()
          .completions.filter((c) => new Date(c.date) >= threeDaysAgo)
          .map((c) => c.challengeId);

        const allChallenges = [...CHALLENGES, ...get().customChallenges];
        const ids = pickDailyChallenges(burnoutType, recentIds, allChallenges);
        set({ todaysChallengeIds: ids, lastDailyRefresh: today, inProgress: {}, swappedTodayIds: [] });
      },

      swapChallenge(challengeId, burnoutType) {
        const { todaysChallengeIds, swappedTodayIds, inProgress, completions } = get();
        const today = getTodayString();

        // Can't swap if already swapped today, in-progress, or completed today
        if (swappedTodayIds.includes(challengeId)) return false;
        if (inProgress[challengeId]?.startedDate === today) return false;
        if (completions.some((c) => c.challengeId === challengeId && c.date === today)) return false;

        // Exclude current stack + already swapped out IDs + recently completed
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const recentIds = completions
          .filter((c) => new Date(c.date) >= threeDaysAgo)
          .map((c) => c.challengeId);
        const exclude = new Set([...todaysChallengeIds, ...swappedTodayIds, ...recentIds]);
        exclude.delete(challengeId); // the one we're replacing is fine to exclude from results

        const allChallenges = [...CHALLENGES, ...get().customChallenges];
        const preferred = burnoutType
          ? allChallenges.filter((c) => c.burnoutTypes.includes(burnoutType) && !exclude.has(c.id))
          : allChallenges.filter((c) => !exclude.has(c.id));
        const pool = preferred.length > 0 ? preferred : allChallenges.filter((c) => !exclude.has(c.id));
        const fallback = pool.length > 0 ? pool : allChallenges.filter((c) => c.id !== challengeId);

        const replacement = fallback[Math.floor(Math.random() * fallback.length)];
        if (!replacement) return false;

        const newIds = todaysChallengeIds.map((id) =>
          id === challengeId ? replacement.id : id
        );
        set({ todaysChallengeIds: newIds, swappedTodayIds: [...swappedTodayIds, challengeId] });
        return true;
      },

      completeChallenge(completion) {
        set((s) => ({ completions: [...s.completions, completion] }));
      },

      isChallengeCompletedToday(challengeId) {
        const today = getTodayString();
        return get().completions.some(
          (c) => c.challengeId === challengeId && c.date === today
        );
      },

      startInProgress(challengeId) {
        const today = getTodayString();
        const existing = get().inProgress[challengeId];
        // Already started today — don't overwrite saved progress
        if (existing?.startedDate === today) return;

        set((s) => ({
          inProgress: {
            ...s.inProgress,
            [challengeId]: {
              startedDate: today,
              moodBefore: null,
              moodAfter: null,
              proofUri: undefined,
              photoAfterUri: undefined,
              timerCompleted: false,
            },
          },
        }));
      },

      updateInProgress(challengeId, updates) {
        set((s) => {
          const existing = s.inProgress[challengeId];
          if (!existing) return s;
          return {
            inProgress: {
              ...s.inProgress,
              [challengeId]: { ...existing, ...updates },
            },
          };
        });
      },

      clearInProgress(challengeId) {
        set((s) => {
          const { [challengeId]: _removed, ...rest } = s.inProgress;
          return { inProgress: rest };
        });
      },

      getTodaysCompletions() {
        const today = getTodayString();
        return get().completions.filter((c) => c.date === today);
      },

      getRecentCompletions(days) {
        const cutoff = new Date(getTodayString());
        cutoff.setDate(cutoff.getDate() - days);
        return get().completions.filter((c) => new Date(c.date) >= cutoff);
      },

      resetAll() {
        set({ todaysChallengeIds: [], lastDailyRefresh: null, completions: [], inProgress: {}, swappedTodayIds: [] });
      },
    }),
    {
      name: 'recharge-challenges',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
