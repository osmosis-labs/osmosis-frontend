import { queryOsmosisCMS } from "./osmosis-cms";
export interface TokenCMSData {
  name?: string;
  symbol?: string;
  description?: string;
  coingeckoID?: string;
  twitterURL?: string;
  websiteURL?: string;
  stakingURL?: string;
}

export const getTokenInfo = (
  denom: string,
  lang: string
): Promise<TokenCMSData> => {
  const filePath = `osmosis-1/generated/asset_detail/${denom.toLowerCase()}_asset_detail_${lang.toLowerCase()}.json`;

  return queryOsmosisCMS({
    repo: "osmosis-labs/assetlists",
    filePath,
    commitHash: undefined,
  });
};
