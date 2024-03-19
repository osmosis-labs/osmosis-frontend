import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { TxEvent } from "@osmosis-labs/stores";
import { AvailableOneClickTradingMessages } from "@osmosis-labs/types";
import { parseAuthenticator } from "@osmosis-labs/utils";

import {
  CreateOneClickSessionError,
  getAuthenticatorIdFromTx,
  getOneClickTradingSessionAuthenticator,
  isAuthenticatorOneClickTradingSession,
} from "../use-create-one-click-trading-session";

jest.mock("~/config", () => ({
  ...jest.requireActual("~/config"),
  SPEND_LIMIT_CONTRACT_ADDRESS: "contract",
}));

describe("isAuthenticatorOneClickTradingSession", () => {
  const key = new PrivKeySecp256k1(Buffer.from("key"));
  const allowedAmount = "1000";
  const resetPeriod = "day";
  const allowedMessages: AvailableOneClickTradingMessages[] = [
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
  ];
  const sessionPeriod = { end: "3600000000000" }; // 1 hour in nanoseconds

  it("should return true for a valid 1-Click Trading Session authenticator", () => {
    const rawAuthenticator = getOneClickTradingSessionAuthenticator({
      key,
      allowedAmount,
      resetPeriod,
      allowedMessages,
      sessionPeriod,
    });
    const authenticator = parseAuthenticator({
      authenticator: {
        id: "1",
        data: Buffer.from(rawAuthenticator.data).toString("base64"),
        type: rawAuthenticator.type,
      },
    });
    expect(isAuthenticatorOneClickTradingSession({ authenticator })).toBe(true);
  });

  it("should return false for an invalid 1-Click Trading Session authenticator", () => {
    const authenticator = {
      type: "AllOfAuthenticator",
      subAuthenticators: [{ type: "InvalidType" }],
    };
    expect(
      isAuthenticatorOneClickTradingSession({
        authenticator: authenticator as any,
      })
    ).toBe(false);
  });
});

describe("getOneClickTradingSessionAuthenticator", () => {
  it("should generate a correct 1-Click Trading Session authenticator", () => {
    const key = PrivKeySecp256k1.generateRandomKey();
    const allowedAmount = "1000";
    const resetPeriod = "day";
    const allowedMessages: AvailableOneClickTradingMessages[] = [
      "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
      "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    ];
    const sessionPeriod = { end: "3600000000000" }; // 1 hour in nanoseconds

    const result = getOneClickTradingSessionAuthenticator({
      key,
      allowedAmount,
      resetPeriod,
      allowedMessages,
      sessionPeriod,
    });

    expect(result.type).toEqual("AllOfAuthenticator");
    const data = JSON.parse(Buffer.from(result.data).toString());
    expect(data).toHaveLength(3);
    expect(data[0].authenticator_type).toEqual(
      "SignatureVerificationAuthenticator"
    );
    expect(data[1].authenticator_type).toEqual("CosmwasmAuthenticatorV1");
    expect(data[2].authenticator_type).toEqual("AnyOfAuthenticator");
  });
});

describe("getAuthenticatorIdFromTx", () => {
  const mockFallbackGetAuthenticatorId = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully finds authenticator ID from events", async () => {
    const events: TxEvent[] = [
      {
        type: "message",
        attributes: [{ key: "authenticator_id", value: "123" }],
      },
    ];
    const result = await getAuthenticatorIdFromTx({
      events,
      userOsmoAddress: "osmo1example",
      publicKey: "publicKeyExample",
      fallbackGetAuthenticatorId: mockFallbackGetAuthenticatorId,
    });
    expect(result).toEqual("123");
    expect(mockFallbackGetAuthenticatorId).not.toHaveBeenCalled();
  });

  it("successfully retrieves authenticator ID through fallback function", async () => {
    const events: TxEvent[] = []; // No authenticator_id in events
    mockFallbackGetAuthenticatorId.mockResolvedValue({ id: "456" });

    const result = await getAuthenticatorIdFromTx({
      events,
      userOsmoAddress: "osmo1example",
      publicKey: "publicKeyExample",
      fallbackGetAuthenticatorId: mockFallbackGetAuthenticatorId,
    });
    expect(result).toEqual("456");
    expect(mockFallbackGetAuthenticatorId).toHaveBeenCalledWith({
      userOsmoAddress: "osmo1example",
      publicKey: "publicKeyExample",
    });
  });

  it("throws an error when authenticator ID is not found", async () => {
    expect.assertions(1);
    const events: TxEvent[] = [];
    mockFallbackGetAuthenticatorId.mockResolvedValue({}); // No id returned

    try {
      await getAuthenticatorIdFromTx({
        events,
        userOsmoAddress: "osmo1example",
        publicKey: "publicKeyExample",
        fallbackGetAuthenticatorId: mockFallbackGetAuthenticatorId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CreateOneClickSessionError);
    }
  });

  it("throws a specific error when fallback function fails", async () => {
    expect.assertions(2); // Make sure the promises are actually called.
    const events: TxEvent[] = [];
    mockFallbackGetAuthenticatorId.mockRejectedValue(
      new Error("Fallback function failed")
    );

    try {
      await getAuthenticatorIdFromTx({
        events,
        userOsmoAddress: "osmo1example",
        publicKey: "publicKeyExample",
        fallbackGetAuthenticatorId: mockFallbackGetAuthenticatorId,
      });
    } catch (e) {
      const error = e as CreateOneClickSessionError;
      expect(error).toBeInstanceOf(CreateOneClickSessionError);
      expect(error.message).toContain(
        "Failed to fetch account public key and authenticators."
      );
    }
  });
});
