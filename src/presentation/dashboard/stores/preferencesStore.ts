import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const PREFERENCES_STORAGE_KEY = "dindin.preferences";

type Preferences = {
  valuesVisible: boolean;
};

type PreferencesState = Preferences & {
  toggleValuesVisible: () => void;
  setValuesVisible: (visible: boolean) => void;
};

export const DEFAULT_PREFERENCES: Preferences = {
  valuesVisible: false,
};

// Preferências do dispositivo: salvas no AsyncStorage e mantidas entre sessões.
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      toggleValuesVisible: () =>
        set((state) => ({ valuesVisible: !state.valuesVisible })),
      setValuesVisible: (valuesVisible) => set({ valuesVisible }),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ valuesVisible }): Preferences => ({ valuesVisible }),
    },
  ),
);

export const selectValuesVisible = (state: PreferencesState) =>
  state.valuesVisible;

export const selectToggleValuesVisible = (state: PreferencesState) =>
  state.toggleValuesVisible;
