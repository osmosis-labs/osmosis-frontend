import { Dec } from "@osmosis-labs/unit";

export const DefaultSlippage = "0.1";
export const ExtremeValueDisparityThreshold = 0.75; // warn when minimum output < 75% of input USD

// Single source of truth for all slippage tiers.
// Values are used to populate selectableSlippages and to compute suggested slippage.
export const DYNAMIC_SLIPPAGE_TIERS = [
  {
    slippage: "0.2",
    minPriceImpact: new Dec(0.003),
    maxLiquidityCap: new Dec(50000),
  },
  {
    slippage: "0.3",
    minPriceImpact: new Dec(0.006),
    maxLiquidityCap: new Dec(25000),
  },
  {
    slippage: "0.5",
    minPriceImpact: new Dec(0.01),
    maxLiquidityCap: new Dec(10000),
  },
  {
    slippage: "1.0",
    minPriceImpact: new Dec(0.03),
    maxLiquidityCap: new Dec(3000),
  },
  {
    slippage: "2.0",
    minPriceImpact: new Dec(0.05),
    maxLiquidityCap: new Dec(1000),
  },
  {
    slippage: "3.0",
    minPriceImpact: new Dec(0.1),
    maxLiquidityCap: new Dec(300),
  },
  {
    slippage: "5.0",
    minPriceImpact: new Dec(0.2),
    maxLiquidityCap: new Dec(100),
  },
];
