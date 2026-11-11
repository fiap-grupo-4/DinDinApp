import { beforeEach, describe, expect, it, vi } from "vitest";

const storageMap = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storageMap.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storageMap.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storageMap.delete(key);
    }),
  },
}));

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  selectToggleValuesVisible,
  selectValuesVisible,
  usePreferencesStore,
} from "./preferencesStore";

describe("usePreferencesStore", () => {
  beforeEach(() => {
    storageMap.clear();
    usePreferencesStore.setState(DEFAULT_PREFERENCES);
  });

  it("inicia com os valores ocultos por padrão", () => {
    expect(selectValuesVisible(usePreferencesStore.getState())).toBe(false);
  });

  it("alterna e define a visibilidade dos valores persistindo no AsyncStorage", async () => {
    const toggle = selectToggleValuesVisible(usePreferencesStore.getState());
    toggle();

    expect(selectValuesVisible(usePreferencesStore.getState())).toBe(true);

    const persistedRaw = storageMap.get(PREFERENCES_STORAGE_KEY);
    expect(persistedRaw).toBeDefined();
    expect(JSON.parse(persistedRaw as string)).toEqual({
      state: { valuesVisible: true },
      version: 1,
    });

    usePreferencesStore.getState().setValuesVisible(false);
    expect(selectValuesVisible(usePreferencesStore.getState())).toBe(false);
  });
});
