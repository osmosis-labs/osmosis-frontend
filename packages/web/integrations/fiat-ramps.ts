import { SpriteIconId } from "~/config";

// Fiat on/off ramps
export type FiatRampKey = "swapped" | "onrampmoney";
export const FiatRampDisplayInfos: Record<
  FiatRampKey,
  {
    rampKey: FiatRampKey;
    iconUrl: string;
    displayName: string;
    logoId?: SpriteIconId;
  }
> = {
  swapped: {
    rampKey: "swapped",
    iconUrl: "/logos/swapped.svg",
    displayName: "Swapped",
  },
  onrampmoney: {
    rampKey: "onrampmoney",
    iconUrl: "/logos/onrampmoney.svg",
    displayName: "Onramp.money",
    logoId: "onrampmoney-logo",
  },
};
