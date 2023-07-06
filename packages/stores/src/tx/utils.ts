export function isSlippageError(tx: any): boolean {
  if (
    tx &&
    tx.code === 7 &&
    tx.codespace === "gamm" &&
    tx.rawLog?.includes("token is lesser than min amount")
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
