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
        "Fetch error. execution blocked by authenticator (account = osmo1sh8lreekwcytxpqr6lxmw5cl7kdrfsdfat2ujlvz, authenticator id = 208, msg index = 0, msg type url = /osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn): Spend limit error: Overspend: 50065777 has been spent but limit is 1000000: execute wasm contract failed [CosmWasm/wasmd@v0.45.1-0.20231128163306-4b9b61faeaa3/x/wasm/keeper/keeper.go:518] With gas wanted: '300000000' and gas used: '412629' .",
      result: true,
    },
    {
      name: "should return true for another valid overspend error message",
      message:
        "Fetch error. Spend limit error: Overspend: 2000 has been spent but limit is 1000.",
      result: true,
    },
    {
      name: "should return true for another valid overspend error message",
      message:
        "Fetch error. execution blocked by authenticator (account = osmo1sh8lreekwcytxpql6lxmw5cl7kdrflpt2ujlvz, authenticator id = 209, msg index = 0, msg type url = /osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn): Spend limit error: Overspend: 23232939 has been spent but limit is 5000000: execute wasm contract failed [CosmWasm/wasmd@v0.45.1-0.20231128163306-4b9b61faeaa3/x/wasm/keeper/keeper.go:518] With gas wanted: '300000000' and gas used: '501232' .",
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
