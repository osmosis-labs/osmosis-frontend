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

// Because encoding seems different in the repo, I've added this function to replace %2F with %252F
const replaceSlashes = (str: string) => {
  return str.split("%2F").join("%252F");
};

export const getTokenInfo = (
  coinMinimalDenom: string,
  lang: string
): Promise<TokenCMSData> => {
  const filePath = `osmosis-1/generated/asset_detail/${replaceSlashes(
    encodeURIComponent(coinMinimalDenom)
  )}_${lang.toLowerCase()}.json`;

  return queryOsmosisCMS({
    repo: "osmosis-labs/assetlists",
    filePath,
    commitHash: undefined,
  });
};
