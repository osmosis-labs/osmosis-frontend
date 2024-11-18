import {
  Identify,
  identify,
  init as amplitudeInit,
  logEvent as amplitudeLogEvent,
} from "@amplitude/analytics-browser";
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
  amplitudeLogEvent(eventName, eventProperties);
  useAmplitudeStore.getState().setLastEvent({ eventName, eventProperties });
};

const setUserAmplitudeProperty = (
  key: keyof UserProperties,
  value: UserProperties[keyof UserProperties]
) => {
  const newIdentify = new Identify();
  newIdentify.set(key, value);
  identify(newIdentify);
};

/** Do-it-all hook for initting Amplitude and logging custom events on page load or at any time. */
export function useAmplitudeAnalytics({
  onLoadEvent,
  init,
}: {
  /** Log this event when the component mounts once. */
  onLoadEvent?: AmplitudeEvent;
  /** Init analytics environment. Done once per user session. */
  init?: true;
} = {}) {
  useEffect(() => {
    if (init) {
      if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY !== undefined) {
        amplitudeInit(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
      }
    }

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
    setUserProperty: setUserAmplitudeProperty,
    getLastEvent,
  };
}
