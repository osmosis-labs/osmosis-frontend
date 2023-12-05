export interface Strategy {
  involvedTokens: string[]; // Tokens[]
  strategyMethod: {
    displayName: string;
    id: string;
  }; // status?
  platform: {
    displayName: string;
    id: string;
  }; // Chain,
  strategyName: string;
  tvl: {
    value: number;
    fluctuation: number;
  };
  apy: number;
  daily: number;
  reward: string[]; // Coin[],
  lock: number; // or Date,
  risk: number; // 1, 2 or 3 ??
  actions: {
    externalURL?: string;
    onClick?: () => void;
  };
  balance: {
    quantity: number;
    converted: string; // $ / € ...
  };
}
