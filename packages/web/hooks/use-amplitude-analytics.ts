import { useEffect } from "react";
import {
  init as amplitudeInit,
  identify,
  Identify,
  logEvent as amplitudeLogEvent,
} from "@amplitude/analytics-browser";
import { AmplitudeEvent, EventProperties, UserProperties } from "../config";

export function useAmplitudeAnalytics({
  onLoadEvent,
  init,
}: {
  onLoadEvent?: AmplitudeEvent;
  init?: true;
} = {}) {
  const logEvent = ([eventName, eventProperties]:
    | [string, Partial<Record<keyof EventProperties, any>> | undefined]
    | [string]) => {
    amplitudeLogEvent(eventName, eventProperties);
  };

  const setUserProperty = (
    key: keyof UserProperties,
    value: UserProperties[keyof UserProperties]
  ) => {
    const newIdentify = new Identify();
    newIdentify.set(key, value);
    identify(newIdentify);
  };

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
