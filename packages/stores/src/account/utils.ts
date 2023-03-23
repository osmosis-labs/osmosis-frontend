interface AccountMsgOpt {
  shareCoinDecimals?: number;
  gas: number;
}

export const createMsgOpts = <Dict extends Record<string, AccountMsgOpt>>(
  dict: Dict
) => dict;

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
