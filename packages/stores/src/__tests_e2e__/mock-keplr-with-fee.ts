/* eslint-disable import/no-extraneous-dependencies */
import { MockKeplr } from "@keplr-wallet/provider-mock";

export class MockKeplrWithFee extends MockKeplr {
  async signAmino(
    ...args: Parameters<MockKeplr["signAmino"]>
  ): ReturnType<MockKeplr["signAmino"]> {
    // force override the max user-tolerated fee amount to be a bunch of uosmo
    // as this is normally selected in the extension popup as our APIs assume
    (args[2].fee as any) = {
      ...args[2].fee,
      amount: [{ amount: "100000000", denom: "uosmo" }],
    };

    return super.signAmino(...args);
  }
}
