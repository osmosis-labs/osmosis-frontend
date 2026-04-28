import {
  DEFAULT_ENABLED_OPTIONAL_CATEGORIES,
  FORCED_ONE_CLICK_CATEGORIES,
  getAllowedMessagesForCategories,
  ONE_CLICK_MESSAGES_BY_CATEGORY,
} from "@osmosis-labs/types";

describe("getAllowedMessagesForCategories", () => {
  it("always includes every forced category", () => {
    const allowed = getAllowedMessagesForCategories({
      poolManagement: false,
      limitOrders: false,
    });
    for (const category of FORCED_ONE_CLICK_CATEGORIES) {
      for (const msg of ONE_CLICK_MESSAGES_BY_CATEGORY[category]) {
        expect(allowed).toContain(msg);
      }
    }
  });

  it("excludes poolManagement messages when poolManagement is off", () => {
    const allowed = getAllowedMessagesForCategories({
      poolManagement: false,
      limitOrders: true,
    });
    for (const msg of ONE_CLICK_MESSAGES_BY_CATEGORY.poolManagement) {
      expect(allowed).not.toContain(msg);
    }
  });

  it("includes poolManagement messages when poolManagement is on", () => {
    const allowed = getAllowedMessagesForCategories({
      poolManagement: true,
      limitOrders: false,
    });
    for (const msg of ONE_CLICK_MESSAGES_BY_CATEGORY.poolManagement) {
      expect(allowed).toContain(msg);
    }
  });

  it("limitOrders contributes no entries to the Osmosis-chain message list", () => {
    const withLimits = getAllowedMessagesForCategories({
      poolManagement: false,
      limitOrders: true,
    });
    const withoutLimits = getAllowedMessagesForCategories({
      poolManagement: false,
      limitOrders: false,
    });
    // limitOrders filters are CosmWasm MsgExecuteContract with a contract
    // address constraint, built separately. Toggling it must not change the
    // flat Osmosis-chain allowed-message list.
    expect(withLimits).toEqual(withoutLimits);
  });

  it("default-on returns the union of every category's messages", () => {
    const allowed = getAllowedMessagesForCategories(
      DEFAULT_ENABLED_OPTIONAL_CATEGORIES
    );
    const expected = [
      ...ONE_CLICK_MESSAGES_BY_CATEGORY.swaps,
      ...ONE_CLICK_MESSAGES_BY_CATEGORY.rewards,
      ...ONE_CLICK_MESSAGES_BY_CATEGORY.poolManagement,
    ];
    // Order doesn't matter for the authenticator, but parity should hold
    expect(allowed.sort()).toEqual(expected.sort());
  });

  it("does not emit duplicate message types across categories", () => {
    const allowed = getAllowedMessagesForCategories(
      DEFAULT_ENABLED_OPTIONAL_CATEGORIES
    );
    expect(new Set(allowed).size).toBe(allowed.length);
  });
});

describe("DEFAULT_ENABLED_OPTIONAL_CATEGORIES", () => {
  it("turns every optional category on by default", () => {
    for (const value of Object.values(DEFAULT_ENABLED_OPTIONAL_CATEGORIES)) {
      expect(value).toBe(true);
    }
  });
});
