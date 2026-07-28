import { LockQueryType } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/lock";

import { makeAddToGaugeMsg, makeCreateGaugeMsg } from "../incentives";

describe("makeCreateGaugeMsg", () => {
  it("composes a ByDuration gauge for a share pool", async () => {
    const msg = await makeCreateGaugeMsg({
      isPerpetual: false,
      owner: "osmo1owner",
      distributeTo: {
        lockQueryType: LockQueryType.ByDuration,
        denom: "gamm/pool/1",
        duration: { seconds: BigInt(86400), nanos: 0 },
        timestamp: new Date(0),
      },
      coins: [{ denom: "uosmo", amount: "1000000" }],
      startTime: new Date(1800000000000),
      numEpochsPaidOver: BigInt(30),
      poolId: BigInt(0),
    });

    expect(msg.typeUrl).toBe("/osmosis.incentives.MsgCreateGauge");
    expect(msg.value.owner).toBe("osmo1owner");
    expect(msg.value.distributeTo?.denom).toBe("gamm/pool/1");
    expect(msg.value.distributeTo?.duration?.seconds).toBe(BigInt(86400));
    expect(msg.value.coins).toEqual([{ denom: "uosmo", amount: "1000000" }]);
    expect(msg.value.numEpochsPaidOver).toBe(BigInt(30));
    expect(msg.value.poolId).toBe(BigInt(0));
  });

  it("composes a NoLock gauge for a concentrated pool", async () => {
    const msg = await makeCreateGaugeMsg({
      isPerpetual: false,
      owner: "osmo1owner",
      distributeTo: {
        lockQueryType: LockQueryType.NoLock,
        denom: "",
        duration: { seconds: BigInt(0), nanos: 0 },
        timestamp: new Date(0),
      },
      coins: [{ denom: "uion", amount: "500" }],
      startTime: new Date(1800000000000),
      numEpochsPaidOver: BigInt(10),
      poolId: BigInt(1252),
    });

    expect(msg.typeUrl).toBe("/osmosis.incentives.MsgCreateGauge");
    expect(msg.value.distributeTo?.lockQueryType).toBe(LockQueryType.NoLock);
    expect(msg.value.distributeTo?.denom).toBe("");
    expect(msg.value.poolId).toBe(BigInt(1252));
  });
});

describe("makeAddToGaugeMsg", () => {
  it("composes a gauge top-up", async () => {
    const msg = await makeAddToGaugeMsg({
      owner: "osmo1owner",
      gaugeId: BigInt(42),
      rewards: [{ denom: "uosmo", amount: "777" }],
    });

    expect(msg.typeUrl).toBe("/osmosis.incentives.MsgAddToGauge");
    expect(msg.value.gaugeId).toBe(BigInt(42));
    expect(msg.value.rewards).toEqual([{ denom: "uosmo", amount: "777" }]);
  });
});
