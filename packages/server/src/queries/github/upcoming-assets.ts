import { ASSET_LIST_COMMIT_HASH } from "../../env";
import { queryGithubFile } from ".";

export interface UpcomingAssets {
  upcomingAssets: {
    /**
     * The name of the asset.
     */
    assetName: string;
    /**
     * The symbol of the asset.
     */
    symbol: string;
    /**
     * The name of the blockchain or network where the asset originates.
     */
    chainName: string;
    /**
     * The URL to the logo image of the asset.
     */
    logoURL?: string;
    images: [
      {
        png?: string;
        svg?: string;
      }
    ];
    socials?: {
      /**
       * The URL to the website of the project/asset.
       */
      website?: string;
      twitter?: string;
    };
    /**
     * The estimated launch date of the asset. Accepts dates in the formats: month name + year (e.g., March 2024), month name + day + year (e.g., March 22, 2024), and quarter + year (e.g., Q2 2024).
     */
    estimatedLaunchDateUtc?: string;
    /**
     * Indicates whether to show the launch date of the asset.
     */
    showLaunchDate: boolean;
    /**
     * Indicates whether Osmosis Stakers or LPs are eligible for an airdrop of the asset.
     */
    osmosisAirdrop: boolean;
    /**
     * The URL to the airdrop info of the project/asset.
     */
    airdropInfoUrl?: string;
  }[];
}

export async function queryUpcomingAssets({
  commitHash = ASSET_LIST_COMMIT_HASH,
  repo = "osmosis-labs/assetlists",
}: {
  repo?: string;
  commitHash?: string;
} = {}): Promise<UpcomingAssets> {
  return await queryGithubFile<UpcomingAssets>({
    filePath: "upcoming/upcoming_assets.json",
    repo,
    commitHash,
  });
}
