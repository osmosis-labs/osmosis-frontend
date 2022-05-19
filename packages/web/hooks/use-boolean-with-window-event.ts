import { useCallback, useEffect, useRef, useState } from "react";

type Options<K extends keyof WindowEventMap> = {
  windowEventName?: K;
  onWindowEvent?: (e: WindowEventMap[K], prevBool: boolean) => boolean;
};

export function useBooleanWithWindowEvent<K extends keyof WindowEventMap>(
  defaultBoolean: boolean,
  { windowEventName = "click" as K, onWindowEvent }: Options<K> = {}
) {
  const listenerRef = useRef<Options<K>["onWindowEvent"] | null>(
    onWindowEvent ?? null
  );

  const [boolean, setBoolean] = useState<boolean>(defaultBoolean);

  const windowListener = useCallback((e: WindowEventMap[K]) => {
    setBoolean(
      (prevBoolean) => listenerRef.current?.(e, prevBoolean) ?? !prevBoolean
    );
  }, []);

  useEffect(() => {
    if (boolean) {
      window.addEventListener(windowEventName, windowListener);
    } else {
      window.removeEventListener(windowEventName, windowListener);
    }
    return () => {
      window.removeEventListener(windowEventName, windowListener);
    };
  }, [boolean, windowEventName, windowListener]);

  return [boolean, setBoolean] as const;
}
