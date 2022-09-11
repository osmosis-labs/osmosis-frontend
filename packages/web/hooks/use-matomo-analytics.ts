import { useEffect } from "react";
import { init as initMatomo, push } from "@socialgouv/matomo-next";
import { INIT_CONFIG } from "../config";

/** [Category, Action, Name?, Value?] */
export type UserEvent =
  | [string, string, string, string | number]
  | [string, string, string]
  | [string, string];

/** Do-it-all hook for initting Matomo and logging custom events on page load or at any time. */
export function useMatomoAnalytics({
  onLoadEvent,
  init,
}: {
  /** Log this event when the component mounts once. */
  onLoadEvent?: UserEvent;
  /** Init analytics environment. Done once per user session. */
  init?: true;
} = {}): {
  trackEvent(event: UserEvent): void;
} {
  function trackEvent(event: UserEvent) {
    if (!Array.isArray(event)) {
      console.error("UserEvent object is not an array");
      return;
    }

    push(["trackEvent", ...event]);
  }

  useEffect(() => {
    if (init) {
      initMatomo(INIT_CONFIG);
    }

    if (onLoadEvent) {
      trackEvent(onLoadEvent);
    }
  }, []);

  return {
    trackEvent,
  };
}
