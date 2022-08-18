import { useEffect } from "react";
import { push } from "@socialgouv/matomo-next";

/** [Category, Action, Name?, Value?] */
export type UserEvent =
  | [string, string, string, string | number]
  | [string, string, string]
  | [string, string];

/** Do-it-all hook for logging custom events on page load or  */
export function useMatomoAnalytics({
  onLoadEvent,
}: { onLoadEvent?: UserEvent } = {}): {
  trackEvent(event: UserEvent): void;
} {
  function trackEvent(event: UserEvent) {
    console.log("Event", ...event);

    push(["trackEvent", ...event]);
  }

  useEffect(() => {
    if (onLoadEvent) {
      trackEvent(onLoadEvent);
    }
  }, []);

  return {
    trackEvent,
  };
}
