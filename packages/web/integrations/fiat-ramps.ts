import { SpriteIconId } from "~/config";

// Fiat on/off ramps
export type FiatRampKey =
  | "kado"
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
  kado: {
    rampKey: "kado",
    iconUrl: "/logos/kado.svg",
    displayName: "Kado",
    logoId: "kado-logo",
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
