import { useEffect } from "react";
import { create } from "zustand";

import { AmplitudeEvent, EventProperties, UserProperties } from "~/config";

/** set to true to see events and properties in console. DON'T COMMIT. */
const DEBUG = false;

type LastEvent = {
  eventName: string;
  eventProperties?: Partial<EventProperties> & Record<string, any>;
};

type AmplitudeStore = {
  lastEvent: LastEvent | null;
  setLastEvent: (event: LastEvent) => void;
};

const useAmplitudeStore = create<AmplitudeStore>((set) => ({
  lastEvent: null,
  setLastEvent: (event) => set({ lastEvent: event }),
}));

export const logAmplitudeEvent = ([eventName, eventProperties]:
  | [string, (Partial<EventProperties> & Record<string, any>) | undefined]
  | [string]) => {
  if (DEBUG) {
    console.info({ name: eventName, props: eventProperties });
  }
  useAmplitudeStore.getState().setLastEvent({ eventName, eventProperties });
};

/** Do-it-all hook for logging custom events on page load or at any time. */
export function useAmplitudeAnalytics({
  onLoadEvent,
}: {
  /** Log this event when the component mounts once. */
  onLoadEvent?: AmplitudeEvent;
  /** Kept for call-site compatibility. Amplitude init is gone. */
  init?: true;
} = {}) {
  useEffect(() => {
    if (onLoadEvent) {
      logAmplitudeEvent(onLoadEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logEvent = (event: AmplitudeEvent) => {
    logAmplitudeEvent(event);
  };

  const getLastEvent = () => useAmplitudeStore.getState().lastEvent;

  return {
    logEvent,
    setUserProperty: (
      _: keyof UserProperties,
      __: UserProperties[keyof UserProperties]
    ) => {
      // no-op: Amplitude identify was never wired back in
    },
    getLastEvent,
  };
}
