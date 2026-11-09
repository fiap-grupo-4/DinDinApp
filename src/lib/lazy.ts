import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  useEffect,
  useRef,
} from "react";

type ModuleWithDefault<P> = { default: ComponentType<P> };

export type PreloadableComponent<P> = LazyExoticComponent<ComponentType<P>> & {
  preload: () => Promise<ModuleWithDefault<P>>;
};

export function lazyWithPreload<P extends object>(
  factory: () => Promise<ModuleWithDefault<P>>,
): PreloadableComponent<P> {
  let modulePromise: Promise<ModuleWithDefault<P>> | undefined;
  const load = () => {
    modulePromise ??= factory();
    return modulePromise;
  };

  return Object.assign(lazy(load), { preload: load });
}

export function runWhenIdle(callback: () => void): () => void {
  if (typeof globalThis.requestIdleCallback === "function") {
    const handle = globalThis.requestIdleCallback(callback);
    return () => globalThis.cancelIdleCallback?.(handle);
  }

  const timeout = setTimeout(callback, 250);
  return () => clearTimeout(timeout);
}

export function usePreloadWhenIdle(
  components: ReadonlyArray<{ preload: () => Promise<unknown> }>,
) {
  useEffect(() => {
    return runWhenIdle(() => {
      for (const component of components) void component.preload();
    });
  }, [components]);
}

export function useHasBeenTrue(value: boolean): boolean {
  const hasBeenTrue = useRef(value);
  if (value) hasBeenTrue.current = true;
  return hasBeenTrue.current;
}
