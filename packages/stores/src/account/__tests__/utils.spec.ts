import type { StdFee } from "@cosmjs/stargate";

import { makeSignDocAmino, runBroadcastedCallbacks } from "../utils";

describe("runBroadcastedCallbacks", () => {
  const txHash = new Uint8Array([1, 2, 3]);

  it("runs the store-wide callback first, then the per-call one", () => {
    const order: string[] = [];
    runBroadcastedCallbacks({
      chainId: "osmosis-1",
      txHash,
      preTxEvent: (chainId, hash) => {
        expect(chainId).toBe("osmosis-1");
        expect(hash).toBe(txHash);
        order.push("pre");
      },
      perCall: (hash) => {
        expect(hash).toBe(txHash);
        order.push("perCall");
      },
    });
    expect(order).toEqual(["pre", "perCall"]);
  });

  it("still runs the per-call callback when the store-wide one throws, then re-throws", () => {
    const perCall = jest.fn();
    expect(() =>
      runBroadcastedCallbacks({
        chainId: "osmosis-1",
        txHash,
        preTxEvent: () => {
          throw new Error("toast exploded");
        },
        perCall,
      })
    ).toThrow("toast exploded");
    expect(perCall).toHaveBeenCalledTimes(1);
    expect(perCall).toHaveBeenCalledWith(txHash);
  });

  it("tolerates either callback being absent", () => {
    const perCall = jest.fn();
    expect(() =>
      runBroadcastedCallbacks({ chainId: "osmosis-1", txHash, perCall })
    ).not.toThrow();
    expect(perCall).toHaveBeenCalledWith(txHash);
    expect(() =>
      runBroadcastedCallbacks({ chainId: "osmosis-1", txHash })
    ).not.toThrow();
  });
});

describe("makeSignDocAmino", () => {
  const fee: StdFee = { amount: [], gas: "200000" };

  it("keeps a uint64 account number exact above the safe integer range", async () => {
    // A real Stride account number, assigned by Cosmos SDK 0.53+ GenerateID().
    // Narrowing it to a JS number would round it to ...879000 and then throw.
    const accountNumber = "10937563465699879211";

    const signDoc = await makeSignDocAmino(
      [],
      fee,
      "stride-1",
      "",
      accountNumber,
      0
    );

    expect(signDoc.account_number).toBe(accountNumber);
  });

  it("passes a normal account number through unchanged", async () => {
    const signDoc = await makeSignDocAmino(
      [],
      fee,
      "osmosis-1",
      "",
      4681093,
      2
    );

    expect(signDoc.account_number).toBe("4681093");
  });

  it("rejects an account number that is not a decimal integer", async () => {
    await expect(
      makeSignDocAmino([], fee, "osmosis-1", "", "1.09e19", 2)
    ).rejects.toThrow("Invalid account number: 1.09e19");
  });

  it("rejects a numeric account number that has already lost precision", async () => {
    // Parsed as a JS number, 10937563465699879211 rounds to ...879000. Those
    // digits are wrong before we ever see them, and they are all decimal digits,
    // so the string check alone would let us sign for a different account.
    const rounded = Number("10937563465699879211");
    expect(rounded.toString()).toBe("10937563465699879000");

    await expect(
      makeSignDocAmino([], fee, "stride-1", "", rounded, 0)
    ).rejects.toThrow(
      "Account number 10937563465699879000 exceeds the safe integer range"
    );
  });
});
