export function isSlippageError(tx: any): boolean {
  if (
    tx &&
    ((tx.code === 7 &&
      tx.codespace === "gamm" &&
      tx.rawLog?.includes("token is lesser than min amount")) ||
      // https://github.com/osmosis-labs/osmosis/blob/14078febf2c1dd50c00110f2c2ac00d1fe9defb2/x/poolmanager/types/errors.go#L65-L67
      tx.rawLog?.includes("price impact protection"))
  ) {
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
