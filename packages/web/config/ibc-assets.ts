import { IBCAsset } from "../stores/assets";

export const IS_FRONTIER = process.env.NEXT_PUBLIC_IS_FRONTIER === "true";
export const UNSTABLE_MSG = "Transfers are disabled due to instability";

/**
 * Determine the channel info per the chain.
 * Guide users to use the same channel for convenience.
 */
export const IBCAssetInfos: (IBCAsset & {
  /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
  depositUrlOverride?: string;

  /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
  withdrawUrlOverride?: string;

  /** Alternative chain name to display as the source chain */
  sourceChainNameOverride?: string;

  /** Related to showing assets on main (canonical) vs frontier (permissionless). Verified means that governance has
   *  voted on its incentivization or general approval (amongst other possibilities).
   */
  isVerified?: boolean;
})[] = [
  // the following are testnet assets
  {
    counterpartyChainId: "sit-5",
    sourceChannelId: "channel-278",
    destChannelId: "channel-0",
    coinMinimalDenom: "usge",
    isVerified: true,
  },
  {
    counterpartyChainId: "imversed-test-1",
    sourceChannelId: "channel-221",
    destChannelId: "channel-1",
    coinMinimalDenom: "nimv",
    isVerified: true,
  },
].filter((ibcAsset) => (IS_FRONTIER ? true : ibcAsset.isVerified));

export default IBCAssetInfos;
