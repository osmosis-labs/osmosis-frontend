import { CoinPretty, Dec } from "@keplr-wallet/unit";

export interface LimitInputProps {
  baseAsset: CoinPretty;
  onChange: (value: string) => void;
  tokenAmount: string;
  price: Dec;
}

export const LimitInput = () => {
  return <div className="relative h-[200px]"></div>;
};
