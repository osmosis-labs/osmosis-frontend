interface AccountMsgOpt {
  shareCoinDecimals?: number;
  gas: number;
}

export const createMsgOpts = <Dict extends Record<string, AccountMsgOpt>>(
  dict: Dict
) => dict;
