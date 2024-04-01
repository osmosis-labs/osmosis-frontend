import { queryOsmosisCMS } from "./query-osmosis-cms";

export interface SwapAdBannerResponse {
  banners: {
    headerOrTranslationKey: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    subheaderOrTranslationKey?: string;
    externalUrl?: string;
    iconImageUrl?: string;
    iconImageAltOrTranslationKey?: string;
    gradient?: string;
    fontColor?: string;
    arrowColor?: string;
    featured?: boolean;
  }[];
  localization: Record<string, Record<string, any>>;
}

/**
 * Fetches the latest update from the osmosis-labs/fe-content repo
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/swap-rotating-banner.json
 */
export async function querySwapAdBanners() {
  return queryOsmosisCMS<SwapAdBannerResponse>({
    filePath: "cms/swap-rotating-banner.json",
  });
}
