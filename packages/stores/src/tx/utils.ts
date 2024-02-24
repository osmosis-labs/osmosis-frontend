export function isSlippageError(tx: any): boolean {
  if (tx && isSlipageErrorMessage(tx.log)) {
    return true;
  }
  return false;
}

export function isError(tx: any) {
  if (tx && typeof tx.code !== "undefined") {
    return true;
  }

  return false;
}

// isSlipageErrorMessage checks if the error message is related to slippage
// Returns true if so, false otherwise.
// Returns false if the message is empty.
// Does simple string matching against chain errors.
export function isSlipageErrorMessage(msg: string) {
  if (!msg) {
    return false;
  }

  return (
    // https://github.com/osmosis-labs/osmosis/blob/b029dfed00128e0d3ca1b866c4e93dc48dd21456/x/concentrated-liquidity/swaps.go#L170
    // https://github.com/osmosis-labs/osmosis/blob/7f5dc22951ca99f31220540ec968de84ddb776f3/x/gamm/keeper/swap.go#L72
    msg.includes("is lesser than min amount") ||
    // https://github.com/osmosis-labs/osmosis/blob/14078febf2c1dd50c00110f2c2ac00d1fe9defb2/x/poolmanager/types/errors.go#L65-L67
    msg.includes("price impact protection")
  );
}
