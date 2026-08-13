import type { AssetVariant } from "@osmosis-labs/server";

import {
  getToastEligibleVariantGroupKeys,
  shouldDisplayAlloyedAssetsToast,
  shouldPersistDismissalOnClose,
} from "~/hooks/alloyed-assets-toast-policy";

const ALL_USDC = "factory/osmo1usdcalloycontract/alloyed/allUSDC";
const ALL_BTC =
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC";
/** Today's USDC canonical: a self-keyed ibc/ denom that is NOT alloyed, with ten
 *  bridged variants under it. The case the alloy-only filter exists to exclude. */
const USDC_IBC_GROUP =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

/** Minimal AssetVariant: the policy reads only canonicalAsset. */
const makeVariant = ({
  groupKey,
  isAlloyed,
}: {
  groupKey: string;
  isAlloyed: boolean;
}): AssetVariant =>
  ({
    name: "Variant",
    canonicalAsset: { coinMinimalDenom: groupKey, isAlloyed },
  } as unknown as AssetVariant);

describe("getToastEligibleVariantGroupKeys", () => {
  it("includes alloyed groups", () => {
    expect(
      getToastEligibleVariantGroupKeys([
        makeVariant({ groupKey: ALL_USDC, isAlloyed: true }),
      ])
    ).toEqual([ALL_USDC]);
  });

  it("excludes non-alloy groups", () => {
    // Legacy consolidations and today's ibc-denom USDC must not be advertised.
    expect(
      getToastEligibleVariantGroupKeys([
        makeVariant({ groupKey: USDC_IBC_GROUP, isAlloyed: false }),
      ])
    ).toEqual([]);
  });

  it("keeps only the alloyed groups from a mixed holding", () => {
    expect(
      getToastEligibleVariantGroupKeys([
        makeVariant({ groupKey: USDC_IBC_GROUP, isAlloyed: false }),
        makeVariant({ groupKey: ALL_BTC, isAlloyed: true }),
        makeVariant({ groupKey: USDC_IBC_GROUP, isAlloyed: false }),
      ])
    ).toEqual([ALL_BTC]);
  });

  it("deduplicates a group held via several variants", () => {
    // The USDC alloy will have many constituents; one holder of three of them
    // must yield one group key, not three.
    expect(
      getToastEligibleVariantGroupKeys([
        makeVariant({ groupKey: ALL_USDC, isAlloyed: true }),
        makeVariant({ groupKey: ALL_USDC, isAlloyed: true }),
        makeVariant({ groupKey: ALL_USDC, isAlloyed: true }),
      ])
    ).toEqual([ALL_USDC]);
  });

  it("tolerates undefined and empty input", () => {
    expect(getToastEligibleVariantGroupKeys(undefined)).toEqual([]);
    expect(getToastEligibleVariantGroupKeys([])).toEqual([]);
  });

  it("treats a missing canonicalAsset flag as not alloyed", () => {
    expect(
      getToastEligibleVariantGroupKeys([
        { name: "x", canonicalAsset: { coinMinimalDenom: ALL_USDC } },
      ] as unknown as AssetVariant[])
    ).toEqual([]);
  });
});

describe("shouldDisplayAlloyedAssetsToast", () => {
  const base = {
    variantGroupKeys: [ALL_USDC],
    isAlloyedAssetsEnabled: true,
    isMobile: false,
    areAllGroupsDismissed: () => false,
  };

  it("shows for an eligible, undismissed group", () => {
    expect(shouldDisplayAlloyedAssetsToast(base)).toBe(true);
  });

  it("does not show when the feature flag is off", () => {
    expect(
      shouldDisplayAlloyedAssetsToast({
        ...base,
        isAlloyedAssetsEnabled: false,
      })
    ).toBe(false);
  });

  it("does not show on mobile", () => {
    expect(shouldDisplayAlloyedAssetsToast({ ...base, isMobile: true })).toBe(
      false
    );
  });

  it("does not show when there are no eligible groups", () => {
    // Guards against the empty list reading as "all dismissed", which is
    // vacuously true and would otherwise invert the decision.
    expect(
      shouldDisplayAlloyedAssetsToast({
        ...base,
        variantGroupKeys: [],
        areAllGroupsDismissed: (keys) => keys.every(() => true),
      })
    ).toBe(false);
  });

  it("does not show when every eligible group is dismissed", () => {
    expect(
      shouldDisplayAlloyedAssetsToast({
        ...base,
        areAllGroupsDismissed: () => true,
      })
    ).toBe(false);
  });

  it("still shows when only some groups are dismissed", () => {
    // The USDC-alloy case: a user who declined allBTC must still hear about
    // allUSDC.
    const dismissed = new Set([ALL_BTC]);
    expect(
      shouldDisplayAlloyedAssetsToast({
        ...base,
        variantGroupKeys: [ALL_BTC, ALL_USDC],
        areAllGroupsDismissed: (keys) => keys.every((k) => dismissed.has(k)),
      })
    ).toBe(true);
  });

  it("passes exactly the eligible keys to the dismissal check", () => {
    // A mismatch here would dismiss or query the wrong groups.
    const seen: string[][] = [];
    shouldDisplayAlloyedAssetsToast({
      ...base,
      variantGroupKeys: [ALL_USDC, ALL_BTC],
      areAllGroupsDismissed: (keys) => {
        seen.push(keys);
        return false;
      },
    });
    expect(seen).toEqual([[ALL_USDC, ALL_BTC]]);
  });
});

describe("shouldPersistDismissalOnClose", () => {
  it("persists only when 'Don't show again' is checked", () => {
    expect(shouldPersistDismissalOnClose(true)).toBe(true);
  });

  it("does NOT persist on a plain close", () => {
    // Regression guard for the old inverted "Remind me later" checkbox, whose
    // unchecked default suppressed every alloy permanently.
    expect(shouldPersistDismissalOnClose(false)).toBe(false);
  });

  it("treats a non-boolean checkbox state as unchecked", () => {
    // Radix's onCheckedChange reports `boolean | "indeterminate"`, so the toast
    // normalises with `checked === true` before calling this. Reproduce that
    // normalisation over every value Radix can emit: only `true` may persist a
    // suppression, since erring toward showing the toast again is the safe
    // direction.
    const normalise = (checked: boolean | "indeterminate" | undefined) =>
      shouldPersistDismissalOnClose(checked === true);

    expect(normalise(true)).toBe(true);
    expect(normalise(false)).toBe(false);
    expect(normalise("indeterminate")).toBe(false);
    expect(normalise(undefined)).toBe(false);
  });
});
