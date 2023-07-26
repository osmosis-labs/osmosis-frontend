import { ObservableQuery } from "@keplr-wallet/stores";
// eslint-disable-next-line import/no-extraneous-dependencies
import { debounce } from "debounce";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useVisibilityState } from "./use-visibility-state";

// When the page is visible, refresh more often.
const defaultActiveRefresh = 60 * 1000;
// When the page is hidden, it refreshes less frequently.
// Users may be looking at other tabs for a long time.
// In this case, it is not necessary to refresh frequently, and if refresh frequently, it may burden the node.
const defaultBackgroundRefresh = 5 * 60 * 1000;

export type RefreshIntervalMs = Partial<{
  /** When this app is the current tab in browser. */
  active: number;
  /** When this app is not the current tab. */
  background: number;
  debounce: number;
}>;

/**
 * Handles refreshing data in the background at different intervals, depending on the page's visibility state.
 * The refresh interval is set to a shorter duration when the page is visible, and a longer duration when the page is hidden.
 * The refresh is debounced to prevent spamming the node with unnecessary requests.
 * This optimizes performance by reducing unnecessary network requests when the user is not actively interacting with the page.
 *
 * @function useBackgroundRefresh
 * @param memoedQueriesOrFn - An array of ObservableQuery instances, or a function to be executed on each refresh. **IMPORTANT** Must be memoed to prevent unnecessary refresh spam.
 * @param [intervals] - An optional & partial object with 'active' and 'background' properties, representing the refresh intervals in milliseconds for visible and hidden page states, respectively. Defaults to a minute for active, and 5 minutes for background, respectively.
 * @returns {void}
 *
 * @example
 * import { useBackgroundRefresh } from "./use-background-refresh";
 * import { someObservableQuery } from "./queries";
 *
 * function MyComponent() {
 *   useBackgroundRefresh([someObservableQuery], { active: 30000, background: 300000 });
 *   // ...rest of the component
 * }
 */
export function useBackgroundRefresh(
  memoedQueriesOrFn: ObservableQuery[] | Function,
  intervals?: RefreshIntervalMs
): void {
  const intervals_ = useMemo(() => {
    return {
      active: intervals?.active ?? defaultActiveRefresh,
      background: intervals?.background ?? defaultBackgroundRefresh,
      debounce: 500,
    };
  }, [intervals?.active, intervals?.background]);
  const windowActive = useVisibilityState() === "visible";
  const [refreshInterval, setRefreshInterval] = useState(intervals_.active);

  // debounce the refresh function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refresh = useCallback(
    debounce(() => {
      if (typeof memoedQueriesOrFn === "function") {
        memoedQueriesOrFn();
      } else {
        memoedQueriesOrFn.forEach((query) => {
          if (!query.isFetching) {
            query.fetch();
          }
        });
      }
    }, intervals_.debounce),
    [memoedQueriesOrFn, intervals_.debounce]
  );

  // react to windowActive changes
  useEffect(() => {
    if (windowActive) {
      refresh(); // refresh right when becoming active
      setRefreshInterval(intervals_.active);
    } else {
      setRefreshInterval(intervals_.background);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, setRefreshInterval, windowActive]);

  // refresh on an interval
  useEffect(() => {
    const disposer = setInterval(refresh, refreshInterval);

    return () => {
      clearInterval(disposer);
    };
  }, [refresh, refreshInterval]);
}
