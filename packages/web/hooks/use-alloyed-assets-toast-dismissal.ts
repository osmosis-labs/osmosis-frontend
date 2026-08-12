import { useCallback } from "react";
import { create } from "zustand";

/** Variant groups (the canonical asset's own coinMinimalDenom) the user has
 *  dismissed the toast for. Per-group so a newly listed alloy always gets one
 *  chance to be seen, regardless of earlier dismissals. */
export const AlloyedAssetsToastDismissedGroupsKey =
  "dismissed-alloyed-assets-toast-groups";

const readDismissedGroups = (): string[] => {
  try {
    const raw = localStorage.getItem(AlloyedAssetsToastDismissedGroupsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === "string")
      : [];
  } catch {
    // Private mode, storage restrictions, or malformed JSON. Treat as "nothing
    // dismissed": showing the toast again is a far better failure than silently
    // suppressing a new alloy.
    return [];
  }
};

const writeDismissedGroups = (groups: string[]) => {
  try {
    localStorage.setItem(
      AlloyedAssetsToastDismissedGroupsKey,
      JSON.stringify(groups)
    );
  } catch {
    // Nothing useful to do; the toast will simply be offered again next session.
  }
};

/**
 * Shared dismissal state, kept in a store rather than per-component
 * `useLocalStorage` state.
 *
 * This must be shared: the toast is rendered by react-toastify into its own tree
 * (mounted in `_app.tsx`), while the hook that decides whether to show it lives
 * in the conversion modal's tree. With `react-use`'s `useLocalStorage` those are
 * two independent `useState`s with no cross-instance sync, so a dismissal
 * written by the toast was invisible to the gate, and each instance merging onto
 * its own stale snapshot could erase the other's writes.
 *
 * Every mutation re-reads localStorage and merges onto the freshly-read value
 * rather than onto captured state, so writers within this tab accumulate instead
 * of clobbering, and a write picks up whatever another tab has already stored.
 *
 * This is best-effort across tabs, not atomic: `getItem` then `setItem` is not a
 * transaction, so two tabs writing in the same instant can still lose one
 * update. There is no lost-update primitive for localStorage, and the cost here
 * is one re-offered toast, so coordinating (a lock key, or a `storage` event
 * listener to re-merge) is not worth the complexity. Do not read the merge as a
 * concurrency guarantee.
 */
const useDismissedGroupsStore = create<{
  dismissedGroups: string[];
  refresh: () => void;
  addGroups: (variantGroupKeys: string[]) => void;
}>((set) => ({
  dismissedGroups: [],
  refresh: () => set({ dismissedGroups: readDismissedGroups() }),
  addGroups: (variantGroupKeys) => {
    // Merge onto storage, not onto store state: another tab may have written
    // since we last read.
    const merged = [
      ...new Set([...readDismissedGroups(), ...variantGroupKeys]),
    ];
    writeDismissedGroups(merged);
    set({ dismissedGroups: merged });
  },
}));

/**
 * Per-variant-group dismissal state for the alloyed-assets toast.
 *
 * Dismissing suppresses only the variant groups the toast was actually showing,
 * so a later alloy still surfaces once rather than being swallowed by a
 * years-old dismissal of some unrelated long-tail variant.
 *
 * The legacy global dismissal key is intentionally ignored so this new,
 * denom-specific experience is offered to every user once.
 */
export const useAlloyedAssetsToastDismissal = () => {
  const dismissedGroups = useDismissedGroupsStore(
    (state) => state.dismissedGroups
  );
  const refresh = useDismissedGroupsStore((state) => state.refresh);
  const addGroups = useDismissedGroupsStore((state) => state.addGroups);

  /** True when every one of `variantGroupKeys` has already been dismissed, so
   *  there is nothing new to tell this user about. An empty list is vacuously
   *  true: there is nothing to show.
   *
   *  Reads storage directly rather than store state so the answer is correct on
   *  the first call of a session, before any `refresh` has run. */
  const areAllGroupsDismissed = useCallback((variantGroupKeys: string[]) => {
    const dismissed = new Set(readDismissedGroups());
    return variantGroupKeys.every((key) => dismissed.has(key));
  }, []);

  const dismissGroups = useCallback(
    (variantGroupKeys: string[]) => {
      if (!variantGroupKeys.length) return;
      addGroups(variantGroupKeys);
    },
    [addGroups]
  );

  return {
    dismissedGroups,
    refresh,
    areAllGroupsDismissed,
    dismissGroups,
  };
};
