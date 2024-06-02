import { getSumTotalSpenderCoinsSpent, matchRawCoinValue } from "../events";

describe("getSumTotalSpenderCoinsSpent", () => {
  it("should sum the event coins spent by a spender", () => {
    const coins = getSumTotalSpenderCoinsSpent(
      "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
      mockEvents
    );

    // 58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc,10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5,65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D,47899690uosmo
    expect(coins).toEqual([
      {
        denom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        amount: "58573",
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        amount: "10541840163500050",
      },
      {
        denom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        amount: "65605821922677750",
      },
      { denom: "uosmo", amount: "47899690" },
    ]);
  });

  it("should sum the event coins spent by a spender - sums multiple spend events", () => {
    const coins = getSumTotalSpenderCoinsSpent(
      "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
      mockMultipleEvents
    );

    // 58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc,10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5,65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D,47899690uosmo
    expect(coins).toEqual([
      {
        denom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        amount: "58573",
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        amount: "21083680327000100",
      },
      {
        denom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        amount: "131211643845355500",
      },
      { denom: "uosmo", amount: "95799380" },
    ]);
  });

  it("should return an empty array when there are no events", () => {
    const coins = getSumTotalSpenderCoinsSpent(
      "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
      []
    );

    expect(coins).toEqual([]);
  });
});

describe("matchRawCoinValue", () => {
  it("should correctly parse denom and amount from a valid input", () => {
    const input =
      "58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc";
    const result = matchRawCoinValue(input);
    expect(result).toEqual({
      denom:
        "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
      amount: "58573",
    });
  });

  it("should return undefined for an invalid input", () => {
    const input = "invalidinput";
    const result = matchRawCoinValue(input);
    expect(result).toBeUndefined();
  });

  it("should correctly parse multiple coins from a comma-separated list", () => {
    const inputs = [
      "58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
      "10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
      "65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
      "47899690uosmo",
    ];

    const expectedResults = [
      {
        denom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        amount: "58573",
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        amount: "10541840163500050",
      },
      {
        denom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        amount: "65605821922677750",
      },
      { denom: "uosmo", amount: "47899690" },
    ];

    inputs.forEach((input, index) => {
      const result = matchRawCoinValue(input);
      expect(result).toEqual(expectedResults[index]);
    });
  });
});

// one spend event
const mockEvents = [
  {
    type: "message",
    attributes: [
      {
        key: "action",
        value: "/osmosis.gamm.v1beta1.MsgJoinPool",
        index: true,
      },
      {
        key: "sender",
        value: "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
        index: true,
      },
      {
        key: "msg_index",
        value: "0",
        index: true,
      },
    ],
  },
  {
    type: "coin_spent",
    attributes: [
      {
        key: "spender",
        value: "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
        index: true,
      },
      {
        key: "amount",
        value:
          "58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc,10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5,65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D,47899690uosmo",
        index: true,
      },
      {
        key: "msg_index",
        value: "0",
        index: true,
      },
    ],
  },
];

const mockMultipleEvents = [
  {
    type: "message",
    attributes: [
      {
        key: "action",
        value: "/osmosis.gamm.v1beta1.MsgJoinPool",
        index: true,
      },
      {
        key: "sender",
        value: "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
        index: true,
      },
      {
        key: "msg_index",
        value: "0",
        index: true,
      },
    ],
  },
  {
    type: "coin_spent",
    attributes: [
      {
        key: "spender",
        value: "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
        index: true,
      },
      {
        key: "amount",
        value:
          "58573factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc,10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5,65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D,47899690uosmo",
        index: true,
      },
      {
        key: "msg_index",
        value: "0",
        index: true,
      },
    ],
  },
  {
    type: "coin_spent",
    attributes: [
      {
        key: "spender",
        value: "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
        index: true,
      },
      {
        key: "amount",
        value:
          "10541840163500050ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5,65605821922677750ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D,47899690uosmo",
        index: true,
      },
      {
        key: "msg_index",
        value: "0",
        index: true,
      },
    ],
  },
];
