import { cosmosAminoConverters } from "@osmosis-labs/proto-codecs";

import { makeBeginRedelegateMsg } from "../cosmos";

describe("makeBeginRedelegateMsg", () => {
  const args = {
    delegatorAddress: "osmo1delegator",
    validatorSrcAddress: "osmovaloper1jailed",
    validatorDstAddress: "osmovaloper1active",
    amount: { denom: "uosmo", amount: "1234567" },
  };

  it("composes a staking redelegation", async () => {
    const msg = await makeBeginRedelegateMsg(args);

    expect(msg.typeUrl).toBe("/cosmos.staking.v1beta1.MsgBeginRedelegate");
    expect(msg.value).toEqual(args);
  });

  it("converts to the cosmos-sdk amino shape for amino signers", async () => {
    const msg = await makeBeginRedelegateMsg(args);
    const converter =
      cosmosAminoConverters["/cosmos.staking.v1beta1.MsgBeginRedelegate"];

    expect(msg.typeUrl).toBe("/cosmos.staking.v1beta1.MsgBeginRedelegate");

    expect(converter.aminoType).toBe("cosmos-sdk/MsgBeginRedelegate");
    expect(converter.toAmino(msg.value)).toEqual({
      delegator_address: "osmo1delegator",
      validator_src_address: "osmovaloper1jailed",
      validator_dst_address: "osmovaloper1active",
      amount: { denom: "uosmo", amount: "1234567" },
    });
  });
});
