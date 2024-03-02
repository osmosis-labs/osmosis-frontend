import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { AvailableOneClickTradingMessages } from "@osmosis-labs/types";
import { parseAuthenticator } from "@osmosis-labs/utils";

import { SPEND_LIMIT_CONTRACT_ADDRESS } from "~/config";

import {
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

  it("should return true for a valid One Click Trading Session authenticator", () => {
    console.log(SPEND_LIMIT_CONTRACT_ADDRESS);
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

  it("should return false for an invalid One Click Trading Session authenticator", () => {
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
  it("should generate a correct One Click Trading Session authenticator", () => {
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
