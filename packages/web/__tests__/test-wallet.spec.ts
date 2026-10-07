import { ChainList } from "~/config/generated/chain-list";

import { TestWallet, testWalletInfo } from "./test-wallet";

describe("mock wallet byte compatibility", () => {
  it("recognizes Node-produced bytes as Uint8Array instances", () => {
    expect(Buffer.alloc(32, 1)).toBeInstanceOf(Uint8Array);
    expect(new TextEncoder().encode("test")).toBeInstanceOf(Uint8Array);
  });

  it("derives a valid account from the test mnemonic", async () => {
    const wallet = new TestWallet(testWalletInfo);
    await wallet.initClient();

    const account = await wallet.client.getAccount!(ChainList[0].chain_id);

    expect(account.algo).toBe("secp256k1");
    expect(account.pubkey).toHaveLength(33);
    expect(account.address).toMatch(/^osmo1/);
  });
});
