import { memo, useMemo } from "react";

import adCMS from "~/components/ad-banner/ad-banner-cms.json";
import {
  AdBannerContent,
  AdBannerProps,
} from "~/components/ad-banner/ad-banner-content";
import { Step, Stepper } from "~/components/stepper/index";

function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => 0.5 - Math.random());
}

export const AdBanner = memo(() => {
  const featuredAds = useMemo(
    () => adCMS.banners.filter(({ featured }) => featured),
    []
  );
  const ads = useMemo(() => shuffleArray(featuredAds), [featuredAds]);

  return (
    <Stepper autoplay={{ delayInMs: 12000, stopOnHover: true }}>
      {ads.map((ad: AdBannerProps) => (
        <Step key={`${ad.name} ${ad.header} ${ad.subheader}`}>
          <AdBannerContent {...ad} />
        </Step>
      ))}
    </Stepper>
  );
});
