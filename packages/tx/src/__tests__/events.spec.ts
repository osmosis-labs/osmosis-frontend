import {
  getEventAttributeValue,
  getLastPositionEventAmounts,
  getSumTotalSpenderCoinsSpent,
  matchRawCoinValue,
} from "../events";

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

  it("should only total the amounts for the specified sender", () => {
    const coins = getSumTotalSpenderCoinsSpent(
      "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
      mockMultipleEvents
    );

    // Expected result is the sum of the amounts for the specified sender, not for osmo13vhcd3xllpvz8tql4dzp8yszxeas8zxpzptyvjttdy7m64kuyz5sv6caqq
    const expectedResult = [
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
    ];

    expect(coins).toEqual(expectedResult);
  });

  it("should handle token swaps coins spent", () => {
    const coins = getSumTotalSpenderCoinsSpent(
      "osmo1gtgx92pxk6hvhc3c3g0xlkrwqq6knymu0e0caw",
      mockTokenSwapEvents
    );

    expect(coins).toEqual([
      { denom: "uosmo", amount: "100000000" },
      { denom: "uion", amount: "100000000" },
    ]);
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
  {
    type: "coin_spent",
    attributes: [
      {
        key: "spender",
        value:
          "osmo13vhcd3xllpvz8tql4dzp8yszxeas8zxpzptyvjttdy7m64kuyz5sv6caqq",
        index: true,
      },
      {
        key: "amount",
        value:
          "2605ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
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

const mockTokenSwapEvents = [
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
    type: "token_swapped",
    attributes: [
      {
        key: "tokens_in",
        value: "100000000uosmo,100000000uion",
        index: true,
      },
    ],
  },
];

describe("getLastPositionEventAmounts", () => {
  const b64 = (x: string) => Buffer.from(x).toString("base64");
  /** A migration's event stream: withdraw, transmuter swap, create. */
  const threeMessageStream = [
    {
      type: "withdraw_position",
      attributes: [
        { key: "amount0", value: "-241143212" },
        { key: "amount1", value: "-18722581" },
      ],
    },
    {
      type: "token_swapped",
      attributes: [
        { key: "tokens_in", value: "18628968ibc/NOBLE" },
        { key: "tokens_out", value: "18628968factory/ALLUSDC" },
      ],
    },
    {
      type: "create_position",
      attributes: [
        { key: "amount0", value: "239937496" },
        { key: "amount1", value: "18591722" },
      ],
    },
  ];

  it("extracts the create amounts from a stream that also swaps", () => {
    const amounts = getLastPositionEventAmounts(
      threeMessageStream,
      "create_position"
    );
    expect(amounts?.amount0.toString()).toBe("239937496");
    expect(amounts?.amount1.toString()).toBe("18591722");
  });

  it("extracts withdraw amounts, stripping the sign", () => {
    const amounts = getLastPositionEventAmounts(
      threeMessageStream,
      "withdraw_position"
    );
    expect(amounts?.amount0.toString()).toBe("241143212");
    expect(amounts?.amount1.toString()).toBe("18722581");
  });

  it("takes the LAST event of the type", () => {
    const amounts = getLastPositionEventAmounts(
      [
        {
          type: "create_position",
          attributes: [
            { key: "amount0", value: "1" },
            { key: "amount1", value: "2" },
          ],
        },
        ...threeMessageStream,
      ],
      "create_position"
    );
    expect(amounts?.amount0.toString()).toBe("239937496");
  });

  it("reads base64-encoded attributes by KEY, never by value shape", () => {
    const amounts = getLastPositionEventAmounts(
      [
        {
          type: "create_position",
          attributes: [
            { key: b64("amount0"), value: b64("239937496") },
            { key: b64("amount1"), value: b64("18591722") },
          ],
        },
      ],
      "create_position"
    );
    expect(amounts?.amount0.toString()).toBe("239937496");
  });

  it("returns undefined when the event or an amount is missing", () => {
    expect(getLastPositionEventAmounts([], "create_position")).toBeUndefined();
    expect(
      getLastPositionEventAmounts(
        [{ type: "create_position", attributes: [] }],
        "create_position"
      )
    ).toBeUndefined();
  });

  it("documents why coinsSpent must not size deposits: a swap short-circuits it", () => {
    const coinsSpent = getSumTotalSpenderCoinsSpent(
      "osmo1address",
      threeMessageStream
    );
    // only the swap's tokens_in survives; the create's deposits are absent
    expect(coinsSpent).toEqual([{ denom: "ibc/NOBLE", amount: "18628968" }]);
  });
});

describe("getEventAttributeValue", () => {
  it("prefers a plain key even when the value looks like base64", () => {
    // "1234ibc/HASH" is entirely base64 alphabet; guessing from the value
    // decodes plain amounts into garbage
    expect(
      getEventAttributeValue(
        [{ key: "tokens_out", value: "1234ibc/HASH" }],
        "tokens_out"
      )
    ).toBe("1234ibc/HASH");
  });
});
