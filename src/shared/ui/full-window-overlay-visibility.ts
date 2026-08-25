import { useSyncExternalStore } from "react";

let visible = true;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function hideFullWindowOverlay() {
  visible = false;
  emit();
}

export function showFullWindowOverlay() {
  visible = true;
  emit();
}

export function useFullWindowOverlayVisible() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => visible,
    () => true,
  );
}
