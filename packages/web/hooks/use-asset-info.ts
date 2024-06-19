import { CoingeckoCoin } from "@osmosis-labs/server";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { COINGECKO_PUBLIC_URL, TWITTER_PUBLIC_URL } from "~/config";
import { useCurrentLanguage } from "~/hooks/user-settings";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { api } from "~/utils/trpc";

interface UseAssetInfoProps {
  coingeckoCoin?: CoingeckoCoin | null;
}

export const useAssetInfo = (props: UseAssetInfoProps = {}) => {
  const { coingeckoCoin } = props;
  const language = useCurrentLanguage();
  const router = useRouter();
  const tokenDenom = router.query.denom as string;

  const { data: token } = api.edge.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: tokenDenom,
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const { data: tokenDetailsByLanguage } = api.local.cms.getTokenInfos.useQuery(
    {
      coinDenom: tokenDenom,
      langs: SUPPORTED_LANGUAGES.map((lang) => lang.value),
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const details = useMemo(() => {
    return tokenDetailsByLanguage
      ? tokenDetailsByLanguage[language]
      : undefined;
  }, [language, tokenDetailsByLanguage]);

  const coinGeckoId = useMemo(
    () => (details?.coingeckoID ? details?.coingeckoID : token?.coinGeckoId),
    [details?.coingeckoID, token]
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

    return token?.coinName;
  }, [details, token]);

  return {
    title,
    details,
    twitterUrl,
    websiteURL,
    coingeckoURL,
    coinGeckoId,
    token: token!,
    tokenDetailsByLanguage,
  };
};
