import { memo, useMemo } from "react";

import { AdBannerContent } from "~/components/ad-banner/ad-banner-content";
import { Ad } from "~/components/ad-banner/ad-banner-types";
import { Step, Stepper } from "~/components/stepper/index";

function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => 0.5 - Math.random());
}

interface AdBannerProps {
  ads: Ad[];
}

export const AdBanner: React.FC<AdBannerProps> = memo(({ ads }) => {
  const randomAds = useMemo(() => shuffleArray(ads), [ads]);

  return (
    <Stepper autoplay={{ delayInMs: 12000, stopOnHover: true }}>
      {randomAds.map((ad: Ad) => (
        <Step key={`${ad.name} ${ad.header} ${ad.subheader}`}>
          <AdBannerContent {...ad} />
        </Step>
      ))}
    </Stepper>
  );
});
