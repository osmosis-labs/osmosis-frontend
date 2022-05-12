import { IBCAsset } from "../stores/assets";
import { IS_FRONTIER } from ".";
import { default as FrontierIbcAssets } from "./ibc-assets.frontier";
import { default as MainIbcAssets } from "./ibc-assets.main";

/**
 * Determine the channel info per the chain.
 * Guide users to use the same channel for convenience.
 */
export const IBCAssetInfos: (IBCAsset & {
  /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
  depositUrlOverride?: string;

  /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
  withdrawUrlOverride?: string;
})[] = IS_FRONTIER ? FrontierIbcAssets : MainIbcAssets;
