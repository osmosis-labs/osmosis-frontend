import { queryOsmosisCMS } from "./osmosis-cms";

export interface AppStoreApp {
  title: string;
  subtitle: string;
  external_URL: string;
  thumbnail_image_URL: string;
  hero_image_URL: string;
  twitter_URL?: string;
  medium_URL?: string;
  github_URL?: string;
  featured?: boolean;
  internal_data: {
    thumbnail_size: number;
    hero_size: number;
    /**
     * Date in ISO format. E.g. "2023-07-31T22:34:16.961Z"
     */
    project_listing_date: string;
  };
}

export interface AppStoreResponse {
  applications: AppStoreApp[];
}

/**
 * Fetches the Osmosis app-store CMS document from the osmosis-labs/fe-content repo.
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/apps/applications.json
 */
export async function queryAppStore() {
  return queryOsmosisCMS<AppStoreResponse>({
    filePath: "cms/apps/applications.json",
  });
}
