import {
  Identify,
  identify,
  init as amplitudeInit,
  logEvent as amplitudeLogEvent,
} from "@amplitude/analytics-browser";
import { useCallback, useEffect } from "react";

import { AmplitudeEvent, EventProperties, UserProperties } from "~/config";

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
  const logEvent = useCallback(
    ([eventName, eventProperties]:
      | [string, (Partial<EventProperties> & Record<string, any>) | undefined]
      | [string]) => {
      amplitudeLogEvent(eventName, eventProperties);
    },
    []
  );

  const setUserProperty = useCallback(
    (
      key: keyof UserProperties,
      value: UserProperties[keyof UserProperties]
    ) => {
      const newIdentify = new Identify();
      newIdentify.set(key, value);
      identify(newIdentify);
    },
    []
  );

  useEffect(() => {
    if (init) {
      if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY !== undefined) {
        amplitudeInit(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
      }
    }

    if (onLoadEvent) {
      logEvent(onLoadEvent);
    }
  }, []);

  return {
    logEvent,
    setUserProperty,
  };
}
