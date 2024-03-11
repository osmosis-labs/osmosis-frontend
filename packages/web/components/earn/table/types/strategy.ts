import {
  Platform,
  StrategyButtonResponsibility,
} from "~/components/earn/table/types/filters";

import { StrategyMethod } from "./filters";

export interface Strategy {
  involvedTokens: string[]; // Tokens[]
  strategyMethod: {
    displayName: string;
    id: StrategyMethod;
  }; // status?
  platform: {
    displayName: string;
    id: Platform;
  }; // Chain,
  strategyName: string;
  tvl: {
    value: number;
    fluctuation?: number;
    depositCap?: {
      total: number;
      actual: number;
    };
  };
  apy: number;
  daily: number;
  reward: string[]; // Coin[],
  lock?: number; // or Date,
  risk: number; // 1, 2 or 3 ??
  actions: {
    externalURL?: string;
    onClick?: () => void;
  };
  balance: {
    quantity: number;
    converted: string; // $ / € ...
  };
  hasLockingDuration: boolean;
  holdsTokens: boolean;
  chainType: StrategyButtonResponsibility;
}
