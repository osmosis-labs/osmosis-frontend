import { useEffect } from "react";
import { init as initMatomo, push } from "@socialgouv/matomo-next";
import { INIT_CONFIG, IS_FRONTIER } from "../config";

/** [Category, Action, Name?, Value?] */
export type UserEvent =
  | [string, string, string, string | number]
  | [string, string, string]
  | [string, string];

/** Do-it-all hook for logging custom events on page load or  */
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
    push(["trackEvent", ...event]);
  }

  useEffect(() => {
    if (init) {
      // matomo analytics
      if (IS_FRONTIER) {
        // only testing matomo on frontier for now
        initMatomo(INIT_CONFIG);
      }
    }

    if (onLoadEvent) {
      trackEvent(onLoadEvent);
    }
  }, []);

  return {
    trackEvent,
  };
}
