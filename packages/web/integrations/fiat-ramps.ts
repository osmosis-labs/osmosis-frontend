import { SpriteIconId } from "~/config";

// Fiat on/off ramps
export type FiatRampKey =
  | "moonpay"
  | "swapped"
  | "transak"
  | "layerswapcoinbase"
  | "onrampmoney";
export const FiatRampDisplayInfos: Record<
  FiatRampKey,
  {
    rampKey: FiatRampKey;
    iconUrl: string;
    displayName: string;
    logoId?: SpriteIconId;
  }
> = {
  moonpay: {
    rampKey: "moonpay",
    iconUrl: "/logos/moonpay.svg",
    displayName: "MoonPay",
    logoId: "moonpay-logo",
  },
  swapped: {
    rampKey: "swapped",
    iconUrl: "/logos/swapped.svg",
    displayName: "Swapped",
  },
  transak: {
    rampKey: "transak",
    iconUrl: "/logos/transak.svg",
    displayName: "Transak",
    logoId: "transak-logo",
  },
  layerswapcoinbase: {
    rampKey: "layerswapcoinbase",
    iconUrl: "/logos/coinbase.svg",
    displayName: "Coinbase",
  },
  onrampmoney: {
    rampKey: "onrampmoney",
    iconUrl: "/logos/onrampmoney.svg",
    displayName: "Onramp.money",
    logoId: "onrampmoney-logo",
  },
};
