import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_UNLOCKED_ITEMS, PET_ITEMS } from "@/constants/challenges";

export type PetMood = "calm" | "happy" | "sleepy";

interface PetState {
  totalPetals: number;
  /** 1–10 */
  level: number;
  mood: PetMood;
  unlockedItemIds: string[];

  awardPetals: (amount: number) => void;
  setMood: (mood: PetMood) => void;
  resetPet: () => void;
}

function levelFromPetals(petals: number): number {
  if (petals < 50) return 1;
  if (petals < 120) return 2;
  if (petals < 220) return 3;
  if (petals < 360) return 4;
  if (petals < 540) return 5;
  if (petals < 760) return 6;
  if (petals < 1020) return 7;
  if (petals < 1320) return 8;
  if (petals < 1660) return 9;
  return 10;
}

export const usePetStore = create<PetState>()(
  persist(
    (set) => ({
      totalPetals: 0,
      level: 1,
      mood: "calm",
      unlockedItemIds: [...DEFAULT_UNLOCKED_ITEMS],

      awardPetals(amount) {
        // Single atomic set — avoids cascading re-renders from two consecutive set() calls
        set((state) => {
          const newTotal = state.totalPetals + amount;
          const newLevel = levelFromPetals(newTotal);

          const newUnlocks = PET_ITEMS.filter(
            (item) =>
              item.petalsRequired > 0 &&
              item.petalsRequired <= newTotal &&
              !state.unlockedItemIds.includes(item.id),
          ).map((item) => item.id);

          return {
            totalPetals: newTotal,
            level: newLevel,
            unlockedItemIds:
              newUnlocks.length > 0
                ? [...state.unlockedItemIds, ...newUnlocks]
                : state.unlockedItemIds,
          };
        });
      },

      setMood(mood) {
        set({ mood });
      },

      resetPet() {
        set({
          totalPetals: 0,
          level: 1,
          mood: "calm",
          unlockedItemIds: [...DEFAULT_UNLOCKED_ITEMS],
        });
      },
    }),
    {
      name: "recharge-pet",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
