import { useRouter } from "next/router";
import { useMemo } from "react";

import { COINGECKO_PUBLIC_URL, TWITTER_PUBLIC_URL } from "~/config";
import { useCurrentLanguage } from "~/hooks/user-settings";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { api } from "~/utils/trpc";

export const useAssetInfo = () => {
  const language = useCurrentLanguage();
  const router = useRouter();
  const denom = router.query.denom as string;

  const { data: asset } = api.edge.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: denom,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: detailsByLanguage } = api.local.cms.getTokenInfos.useQuery(
    {
      coinDenom: denom,
      langs: SUPPORTED_LANGUAGES.map((lang) => lang.value),
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const details = useMemo(() => {
    return detailsByLanguage ? detailsByLanguage[language] : undefined;
  }, [language, detailsByLanguage]);

  const coinGeckoId = useMemo(
    () => (details?.coingeckoID ? details?.coingeckoID : asset?.coinGeckoId),
    [details?.coingeckoID, asset]
  );

  const { data: coingeckoCoin, isLoading: isLoadingCoingeckoCoin } =
    api.edge.assets.getCoingeckoCoin.useQuery(
      { coinGeckoId: coinGeckoId! },
      {
        enabled: coinGeckoId !== undefined,
      }
    );

  const twitterUrl = useMemo(() => {
    if (details?.twitterURL) {
      return details.twitterURL;
    }

    if (coingeckoCoin?.links?.twitter_screen_name) {
      return `${TWITTER_PUBLIC_URL}/${coingeckoCoin.links.twitter_screen_name}`;
    }
  }, [coingeckoCoin?.links?.twitter_screen_name, details?.twitterURL]);

  const websiteURL = useMemo(() => {
    if (details?.websiteURL) {
      return details.websiteURL;
    }

    if (
      coingeckoCoin?.links?.homepage &&
      coingeckoCoin.links.homepage.length > 0
    ) {
      return coingeckoCoin.links.homepage.filter((link) => link.length > 0)[0];
    }
  }, [coingeckoCoin?.links?.homepage, details?.websiteURL]);

  const coingeckoURL = useMemo(() => {
    if (coinGeckoId) {
      return `${COINGECKO_PUBLIC_URL}/en/coins/${coinGeckoId}`;
    }
  }, [coinGeckoId]);

  const title = useMemo(() => {
    if (details) {
      return details.name;
    }

    return asset?.coinName;
  }, [details, asset]);

  return {
    title,
    details,
    twitterUrl,
    websiteURL,
    coingeckoURL,
    coinGeckoId,
    asset: asset!,
    denom,
    detailsByLanguage,
    coingeckoCoin,
    isLoadingCoingeckoCoin,
  };
};
