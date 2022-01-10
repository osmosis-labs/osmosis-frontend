import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  windowEventName?: string;
  onWindowEvent?: (prevBool?: boolean) => boolean;
};

export function useBooleanWithWindowEvent(
  defaultBoolean: boolean,
  { windowEventName = "click", onWindowEvent }: Options = {}
) {
  const listenerRef = useRef<Options["onWindowEvent"] | null>(
    onWindowEvent ?? null
  );

  const [boolean, setBoolean] = useState<boolean>(defaultBoolean);

  const windowListener = useCallback(() => {
    setBoolean(
      (prevBoolean) => listenerRef.current?.(prevBoolean) ?? !prevBoolean
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
