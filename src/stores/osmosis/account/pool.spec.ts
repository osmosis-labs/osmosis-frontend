import assert from "assert";
import "mocha";

import { createTestStore, waitAccountLoaded } from "../../test-env";

describe("Test osmosis basic tsx", () => {
  const { chainStore, accountStore } = createTestStore();

  it("Test MsgCreatePool", async () => {
    const osmosisChain = chainStore.current;

    const accountInfo = accountStore.getAccount(osmosisChain.chainId);

    await waitAccountLoaded(accountInfo);

    console.log(accountInfo.bech32Address);

    assert.strictEqual(accountInfo.bech32Address, "");
  });
});
