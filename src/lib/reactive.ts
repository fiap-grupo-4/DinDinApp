import { useCallback, useEffect, useRef, useState } from "react";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";

export function useDebouncedText(
  onDebouncedChange: (value: string) => void,
  delayInMs = 300,
) {
  const [text$] = useState(() => new Subject<string>());
  const callbackRef = useRef(onDebouncedChange);
  callbackRef.current = onDebouncedChange;

  useEffect(() => {
    const subscription = text$
      .pipe(
        map((text) => text.trim()),
        debounceTime(delayInMs),
        distinctUntilChanged(),
      )
      .subscribe((value) => callbackRef.current(value));

    return () => subscription.unsubscribe();
  }, [text$, delayInMs]);

  return useCallback((text: string) => text$.next(text), [text$]);
}
