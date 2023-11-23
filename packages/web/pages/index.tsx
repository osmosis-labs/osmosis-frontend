import { observer } from "mobx-react-lite";
import type { GetStaticProps, InferGetStaticPropsType } from "next";

import { Ad, AdCMS } from "~/components/ad-banner/ad-banner-types";
import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { EventName } from "~/config";
import adCMSData from "~/config/ads-banner.json";
import { useAmplitudeAnalytics } from "~/hooks";

interface HomeProps {
  ads: Ad[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  let ads: Ad[] = [];

  const adCMS = adCMSData as AdCMS;

  try {
    // const { data: adCMS }: { data: AdCMS } = await axiosInstance.get(
    //   ADS_BANNER_URL
    // );
    ads = adCMS.banners.filter(({ featured }) => featured);
  } catch (error) {
    console.error("Error fetching ads:", error);
  }

  return { props: { ads } };
};

const Home = ({ ads }: InferGetStaticPropsType<typeof getStaticProps>) => {
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  return (
    <main className="relative flex h-full items-center overflow-auto bg-osmoverse-900 py-2">
      <div className="pointer-events-none fixed h-full w-full bg-home-bg-pattern bg-cover bg-repeat-x">
        <svg
          className="absolute h-full w-full lg:hidden"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio="xMidYMid slice"
        >
          <g>
            <ProgressiveSvgImage
              lowResXlinkHref="/images/osmosis-home-bg-low.png"
              xlinkHref="/images/osmosis-home-bg.png"
              x="56"
              y="220"
              width="578.7462"
              height="725.6817"
            />
            <ProgressiveSvgImage
              lowResXlinkHref={"/images/osmosis-home-fg-low.png"}
              xlinkHref={"/images/osmosis-home-fg.png"}
              x={"61"}
              y={"682"}
              width={"448.8865"}
              height={"285.1699"}
            />
          </g>
        </svg>
      </div>
      <div className="my-auto flex h-auto w-full items-center">
        <div className="ml-auto mr-[15%] flex w-[27rem] flex-col gap-4 lg:mx-auto md:mt-mobile-header">
          <SwapTool ads={ads} />
        </div>
      </div>
    </main>
  );
};

export default observer(Home);
