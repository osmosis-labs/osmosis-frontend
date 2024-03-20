import axios from "axios";

import { CMS_REPOSITORY_PATH, GITHUB_URL } from "../../env";

const githubApi = axios.create({
  baseURL: GITHUB_URL,
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
});

export interface TokenCMSData {
  name?: string;
  symbol?: string;
  description?: string;
  coingeckoID?: string;
  twitterURL?: string;
  websiteURL?: string;
  stakingURL?: string;
}

export const getTokenInfo = (denom: string, lang: string) => {
  const fileName = `${denom.toLowerCase()}_token_info_${lang.toLowerCase()}.json`;

  if (!CMS_REPOSITORY_PATH)
    throw new Error("Forgot to set CMS_REPOSITORY_PATH env var");
  if (!GITHUB_URL) throw new Error("Forgot to set GITHUB_URL env var");

  return githubApi
    .get<TokenCMSData>(`${CMS_REPOSITORY_PATH}/tokens/${fileName}`)
    .then((r) => r.data);
};
