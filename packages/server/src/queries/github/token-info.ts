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
  const fileName = `${denom.toLowerCase()}_asset_detail_${lang.toLowerCase()}.json`;

  if (!CMS_REPOSITORY_PATH || !GITHUB_URL) {
    const missingVars = [
      !CMS_REPOSITORY_PATH ? "CMS_REPOSITORY_PATH" : "",
      !GITHUB_URL ? "GITHUB_URL" : "",
    ]
      .filter(Boolean)
      .join(", ");
    console.error(`Missing environment variables: ${missingVars}`);
    throw new Error(`Missing environment variables: ${missingVars}`);
  }

  return githubApi
    .get<TokenCMSData>(`${CMS_REPOSITORY_PATH}/${fileName}`)
    .then((r) => r.data);
};
