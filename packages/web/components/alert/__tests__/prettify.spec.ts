import cases from "jest-in-case";

import { isOverspendErrorMessage, isRejectedTxErrorMessage } from "../prettify";

cases(
  "isOverspendErrorMessage",
  ({ message, result }) => {
    expect(isOverspendErrorMessage({ message })).toBe(result);
  },
  [
    {
      name: "should return true for valid overspend error messages",
      message:
        "execution blocked by authenticator (account = osmo12smx2wdlyttvyzvzgfayfz23nqwq2qjateuf7thj, authenticator id = 350, msg index = 0, msg type url = /osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn): Spend limit error: Overspend: remaining quota 3451138, requested 7744313: execute wasm contract failed [CosmWasm/wasmd@v0.45.1-0.20231128163306-4b9b61faeaa3/x/wasm/keeper/keeper.go:518] With gas wanted: '300000000' and gas used: '807240'",
      result: true,
    },
    {
      name: "should return true for another valid overspend error message",
      message:
        "Spend limit error: Overspend: remaining quota 1000, requested 2000",
      result: true,
    },
    {
      name: "should return true for another valid overspend error message",
      message:
        "execution blocked by authenticator (account = osmo12smx2wdlyttvyzvzgfayfz23nqwq2qjateuf7thj, authenticator id = 353, msg index = 0, msg type url = /osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn): Spend limit error: Overspend: remaining qouta 5000000, requested 23232939: execute wasm contract failed [CosmWasm/wasmd@v0.45.1-0.20231128163306-4b9b61faeaa3/x/wasm/keeper/keeper.go:518] With gas wanted: '300000000' and gas used: '501232' ",
      result: true,
    },
    {
      name: "should return false for non-overspend error message: execution succeeded",
      message: "execution succeeded",
      result: false,
    },
    {
      name: "should return false for non-overspend error message: Insufficient balance",
      message:
        "Insufficient balance for transaction fees. Please add funds to continue.",
      result: false,
    },
    {
      name: "should return false for non-overspend error message: Request rejected",
      message: "Request rejected",
      result: false,
    },
  ]
);

cases(
  "isRejectedTxErrorMessage",
  ({ message, result }) => {
    expect(isRejectedTxErrorMessage({ message })).toBe(result);
  },
  [
    {
      name: "should return true for message explicitly stating rejection",
      message: "Request rejected by the server",
      result: true,
    },
    {
      name: "should return false for generic error message",
      message: "Transaction rejected due to insufficient funds",
      result: false,
    },
    {
      name: "should return false for message not related to rejection",
      message: "Transaction completed successfully",
      result: false,
    },
    {
      name: "should return false for generic error message",
      message: "An unknown error occurred",
      result: false,
    },
    {
      name: "should return false for message about insufficient balance",
      message: "Insufficient balance for transaction",
      result: false,
    },
  ]
);
