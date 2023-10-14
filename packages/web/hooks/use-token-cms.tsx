import { useStore } from "~/stores";

interface UseTokenCMSProps {
  denom: string;
  lang: string;
}

export interface TokenCMSData {
  name?: string;
  coinMinimalDenom?: string;
  description?: string;
  coingeckoURL?: string;
  twitterURL?: string;
  websiteURL?: string;
}

export const OsmosisTokenInfoRepoName = "osmosis-labs/token-info";
export const OsmosisTokenInfoFilePath =
  "contents/tokens/{denom}_token_info_{lang}.json";

export function useTokenCMS(props: UseTokenCMSProps) {
  const { denom, lang } = props;
  const { queriesExternalStore } = useStore();

  const tokenDetails =
    queriesExternalStore.queryGitHubFile.getFile<TokenCMSData>({
      repo: OsmosisTokenInfoRepoName,
      filePath: OsmosisTokenInfoFilePath.replace(
        "{denom}",
        denom.toLowerCase()
      ).replace("{lang}", lang.toLowerCase()),
    });

  return { details: tokenDetails.response?.data };
}
