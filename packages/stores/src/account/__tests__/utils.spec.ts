import type { StdFee } from "@cosmjs/stargate";

import { makeSignDocAmino } from "../utils";

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
