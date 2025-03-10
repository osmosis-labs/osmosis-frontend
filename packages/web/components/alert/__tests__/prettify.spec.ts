import cases from "jest-in-case";

import { isRejectedTxErrorMessage } from "../prettify";

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
