import { queryOsmosisCMS } from "./osmosis-cms";

interface GenericCmsData {
  localization?: string;
  name?: string;
  symbol?: string;
  coingeckoID?: string;
  twitterURL?: string;
  websiteURL?: string;
  stakingURL?: string;
}
interface RawTokenCMSData extends GenericCmsData {
  description?: Record<string, string>;
}

export interface TokenCMSData extends GenericCmsData {
  description?: string;
}

// Because encoding seems different in the repo, I've added this function to replace %2F with %252F
const replaceSlashes = (str: string) => {
  return str.split("%2F").join("%252F");
};

export const getTokenInfo = async (
  coinMinimalDenom: string,
  lang: string
): Promise<TokenCMSData> => {
  const filePath = `osmosis-1/generated/asset_detail/${replaceSlashes(
    encodeURIComponent(coinMinimalDenom)
  )}.json`;

  const file = (await queryOsmosisCMS({
    repo: "JeremyParish69/assetlists",
    filePath,
    commitHash: "merge_asset_detail_localizations",
  })) as RawTokenCMSData;

  return {
    ...file,
    description: file.description?.[lang] ?? "",
  };
};
