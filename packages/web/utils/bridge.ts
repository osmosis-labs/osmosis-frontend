import type { Bridge } from "@osmosis-labs/bridge";

export const BridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  IBC: "/bridges/ibc.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/bridges/wormhole.svg",
  Nitro: "/bridges/nitro.svg",
  Penumbra: "/networks/penumbra.svg",
  Int3face: "/bridges/int3face.svg",
};

export const ExternalBridgeLogoUrls: Record<Bridge | "Generic", string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  IBC: "/bridges/ibc.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/bridges/wormhole.svg",
  Generic: "/external-bridges/generic.svg",
  Nitro: "/bridges/nitro.svg",
  Penumbra: "/networks/penumbra.svg",
  Int3face: "/bridges/int3face.svg",
};

/**
 * Logos for third-party `external_interface` bridge connectors, keyed by the
 * asset-list transfer-method `name` (e.g. "Osmosis Wormhole Connect"), NOT the
 * `Bridge` enum. These links come from asset data, not a provider module, so
 * `ExternalBridgeLogoUrls` (enum-keyed) can't resolve them — they previously all
 * fell back to the Generic placeholder. Use {@link getExternalInterfaceLogo}.
 *
 * Only names whose brand asset is genuinely present + correct are listed; any
 * other connector falls back to Generic (no broken image, no regression). Add a
 * new entry only alongside a real brand asset under `/public/external-bridges`
 * or `/public/bridges` — do NOT map to an unrelated chain logo (e.g. "Dymension
 * Portal" is Dymension's portal, not Wormhole Portal, so it stays Generic until
 * a Dymension asset exists). Remaining unmapped names tracked in MTN-196.
 */
const ExternalInterfaceLogoUrls: Record<string, string> = {
  // Wormhole (the existing wormhole asset is the correct brand).
  "Osmosis Wormhole Connect": "/bridges/wormhole.svg",
  // Squid as an external_interface (same brand as the Squid provider).
  Squid: "/bridges/squid.svg",
};

/**
 * Logo for an `external_interface` connector, resolved in priority order:
 * 1. `logoUri` from the asset-list connector data (authoritative; the durable
 *    home for connector logos),
 * 2. the name-keyed {@link ExternalInterfaceLogoUrls} map (frontend fallback for
 *    connectors whose data doesn't yet carry a logo),
 * 3. the Generic placeholder.
 *
 * The name-map is the interim layer: as connectors gain a `logo_uri` in the
 * assetlist it is superseded per-connector, and can be retired once all carry one.
 */
export function getExternalInterfaceLogo(
  name: string,
  logoUri?: string
): string {
  return (
    logoUri ??
    ExternalInterfaceLogoUrls[name] ??
    ExternalBridgeLogoUrls["Generic"]
  );
}
