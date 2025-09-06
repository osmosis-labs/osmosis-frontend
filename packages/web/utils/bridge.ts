import type { Bridge } from "@osmosis-labs/bridge";

export const BridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  Axelar: "/bridges/axelar.svg",
  IBC: "/bridges/ibc.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/bridges/wormhole.svg",
  Nitro: "/bridges/nitro.svg",
  Penumbra: "/networks/penumbra.svg",
  Int3face: "/bridges/int3face.svg",
  FastUsdc: "/bridges/fast-usdc.svg",
};

export const ExternalBridgeLogoUrls: Record<Bridge | "Generic", string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  Axelar: "/external-bridges/satellite.svg",
  IBC: "/external-bridges/tfm.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/bridges/wormhole.svg",
  Generic: "/external-bridges/generic.svg",
  Nitro: "/bridges/nitro.svg",
  Penumbra: "/networks/penumbra.svg",
  Int3face: "/bridges/int3face.svg",
  FastUsdc: "/bridges/fast-usdc.svg",
};
