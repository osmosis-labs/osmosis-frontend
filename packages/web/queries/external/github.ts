import axios from "axios";

import { CMS_REPOSITORY_PATH, GITHUB_URL } from "~/config";

const githubApi = axios.create({
  baseURL: GITHUB_URL,
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
});

export interface TokenCMSData {
  name?: string;
  coinMinimalDenom?: string;
  description?: string;
  coingeckoURL?: string;
  twitterURL?: string;
  websiteURL?: string;
}

export const getTokenInfo = (denom: string, lang: string) => {
  const fileName = `${denom.toLowerCase()}_token_info_${lang.toLowerCase()}.json`;

  return githubApi
    .get<TokenCMSData>(`${CMS_REPOSITORY_PATH}/tokens/${fileName}`)
    .then((r) => r.data);
};
