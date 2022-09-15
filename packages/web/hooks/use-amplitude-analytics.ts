import { useEffect } from "react";
import {
  identify,
  Identify,
  logEvent as amplitudeLogEvent,
} from "@amplitude/analytics-browser";
import { AmplitudeEvent, EventProperties, UserProperties } from "../config";

export function useAmplitudeAnalytics({
  onLoadEvent,
}: {
  onLoadEvent?: AmplitudeEvent;
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
    if (onLoadEvent) {
      logEvent(onLoadEvent);
    }
  }, []);

  return {
    logEvent,
    setUserProperty,
  };
}
