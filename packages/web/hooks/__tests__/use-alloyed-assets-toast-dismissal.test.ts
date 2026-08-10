/* eslint-disable import/no-extraneous-dependencies -- @testing-library/react is a
   devDependency of this package; other hook tests here import it the same way. */
import { act, renderHook } from "@testing-library/react";

import {
  AlloyedAssetsToastDismissedGroupsKey,
  useAlloyedAssetsToastDismissal,
} from "~/hooks/use-alloyed-assets-toast-dismissal";

const LEGACY_DISMISSAL_KEY = "do-not-show-alloyed-assets-toast";

const ALL_BTC =
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC";
const ALL_ETH =
  "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH";
/** Stands in for an alloy listed after another group was dismissed. */
const ALL_USDC = "factory/osmo1newalloycontract/alloyed/allUSDC";
/** A non-alloy variant group: variantGroupKey also groups plain canonical
 *  assets, so the dismissal set must handle ibc/ denoms too. */
const USDC_AXL_GROUP =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

const readDismissedGroups = (): string[] | undefined => {
  const raw = window.localStorage.getItem(AlloyedAssetsToastDismissedGroupsKey);
  return raw ? JSON.parse(raw) : undefined;
};

/** Fresh store state per test: the dismissal store is module-level, so it
 *  survives between tests the way it survives between component mounts. */
const resetStore = () => {
  const { result } = renderHook(() => useAlloyedAssetsToastDismissal());
  act(() => result.current.refresh());
};

describe("useAlloyedAssetsToastDismissal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetStore();
  });

  it("does not consider an unseen variant group dismissed", () => {
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(false);
  });

  it("suppresses only the groups that were dismissed", () => {
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    act(() => result.current.dismissGroups([ALL_BTC]));

    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(true);
    // A different alloy the user has never been prompted about must still show.
    expect(result.current.areAllGroupsDismissed([ALL_USDC])).toBe(false);
    // A mixed set is not fully dismissed, so the toast still has news to give.
    expect(result.current.areAllGroupsDismissed([ALL_BTC, ALL_USDC])).toBe(
      false
    );
  });

  it("handles non-alloy (ibc denom) variant groups", () => {
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    act(() => result.current.dismissGroups([USDC_AXL_GROUP]));

    expect(result.current.areAllGroupsDismissed([USDC_AXL_GROUP])).toBe(true);
    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(false);
  });

  it("accumulates dismissals across calls without duplicating", () => {
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    act(() => result.current.dismissGroups([ALL_BTC]));
    act(() => result.current.dismissGroups([ALL_BTC, ALL_ETH]));

    expect(readDismissedGroups()?.sort()).toEqual([ALL_BTC, ALL_ETH].sort());
  });

  it("treats an empty group list as nothing to show", () => {
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    expect(result.current.areAllGroupsDismissed([])).toBe(true);
  });

  // The toast renders in react-toastify's tree while the gate lives in the
  // conversion modal's tree, so these are genuinely separate hook instances.
  // With per-component useLocalStorage state, the writes below clobbered each
  // other and the gate never saw the toast's dismissal.
  describe("multiple hook instances", () => {
    it("a dismissal in one instance is visible to another", () => {
      const gate = renderHook(() => useAlloyedAssetsToastDismissal());
      const toast = renderHook(() => useAlloyedAssetsToastDismissal());

      act(() => toast.result.current.dismissGroups([ALL_BTC]));

      expect(gate.result.current.areAllGroupsDismissed([ALL_BTC])).toBe(true);
    });

    it("concurrent writes accumulate instead of clobbering", () => {
      const gate = renderHook(() => useAlloyedAssetsToastDismissal());
      const toast = renderHook(() => useAlloyedAssetsToastDismissal());

      act(() => gate.result.current.dismissGroups([ALL_BTC]));
      act(() => toast.result.current.dismissGroups([ALL_ETH]));

      expect(readDismissedGroups()?.sort()).toEqual([ALL_BTC, ALL_ETH].sort());
    });
  });

  it("survives malformed stored JSON without suppressing anything", () => {
    window.localStorage.setItem(
      AlloyedAssetsToastDismissedGroupsKey,
      "not json{"
    );
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    // Failing open (show the toast) beats silently hiding a new alloy.
    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(false);
  });

  it("ignores the legacy global dismissal so every user sees the new toast", () => {
    window.localStorage.setItem(LEGACY_DISMISSAL_KEY, "true");
    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(false);
  });

  it("leaves groups undismissed when the user never dismissed them", () => {
    window.localStorage.setItem(
      AlloyedAssetsToastDismissedGroupsKey,
      JSON.stringify([ALL_BTC])
    );

    const { result } = renderHook(() => useAlloyedAssetsToastDismissal());

    expect(result.current.areAllGroupsDismissed([ALL_BTC])).toBe(true);
    expect(result.current.areAllGroupsDismissed([ALL_ETH])).toBe(false);
  });
});
