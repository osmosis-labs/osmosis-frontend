import Fuse from "fuse.js";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";
import { useWindowSize } from "react-use";

import { buttonCVA } from "~/components/buttons";
import { HeroCard } from "~/components/cards";
import { AppDisplayCard } from "~/components/cards/app-display-card";
import { SearchBox } from "~/components/input";
import { Breakpoint } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

type AppDataType = {
  title: string;
  subtitle: string;
  thumbnail_image_URL: string;
  external_URL: string;
  twitter_URL?: string;
  github_URL?: string;
  medium_URL?: string;
  featured?: boolean;
};

type App = {
  title: string;
  subtitle: string;
  external_URL: string;
  thumbnail_image_URL: string;
  hero_image_URL: string;
  twitter_URL?: string;
  medium_URL?: string;
  github_URL?: string;
  featured?: boolean;
};

type AppStoreProps = {
  apps: {
    applications: App[];
  };
};

export const AppStore: React.FC<AppStoreProps> = ({ apps }) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [fuzzySearchResults, setFuzzySearchResults] = useState<AppDataType[]>(
    []
  );
  const [fuse, setFuse] = useState<Fuse<App> | null>(null);

  const { applications } = apps;

  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.AppStore.pageViewed],
  });
  const { width } = useWindowSize();

  useEffect(() => {
    const options = {
      keys: ["title"],
    };
    setFuse(new Fuse(applications, options));
  }, [applications]);

  let featuredApp = applications?.find((app) => app.featured === true);
  const nonFeaturedApps = applications?.filter((app) => !app.featured);

  featuredApp = featuredApp ? featuredApp : nonFeaturedApps[0];

  const handleApplyClick = () => {
    logEvent([EventName.AppStore.applyClicked]);
  };

  const handleSearchInput = (value: string) => {
    if (fuse) {
      const searchResults = fuse.search(value);
      const appDataResults: AppDataType[] = searchResults.map(
        (result) => result.item as AppDataType
      );

      setSearchValue(value);
      setFuzzySearchResults(appDataResults);
    }
  };

  const iterableData = searchValue ? fuzzySearchResults : nonFeaturedApps;

  const searchBoxSize = useMemo(() => {
    if (width <= Breakpoint.SM) {
      return "small";
    } else if (width <= Breakpoint.LG) {
      return "medium";
    }
    return "long";
  }, [width]);

  return (
    <main className="mx-auto flex max-w-container flex-col bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <div className="flex flex-row justify-between pl-6 md:flex-col">
        <div className="mb-0 basis-1/2 lg:mr-4 md:mb-4 md:mr-0">
          <h4 className="pb-2 text-wosmongton-100">{t("store.headerTitle")}</h4>
          <span className="body2 text-osmoverse-200">
            {t("store.headerSubtitle")}
          </span>
        </div>
        <div>
          <SearchBox
            placeholder={t("store.searchPlaceholder")}
            onInput={handleSearchInput}
            className="self-end"
            size={searchBoxSize || "long"}
          />
        </div>
      </div>
      <HeroCard
        title={featuredApp.title}
        subtitle={featuredApp.subtitle}
        imageUrl={featuredApp.hero_image_URL}
        githubUrl={featuredApp.github_URL}
        twitterUrl={featuredApp.twitter_URL}
        externalUrl={featuredApp.external_URL}
        mediumUrl={featuredApp.medium_URL}
      />
      <div className="body2 mb-2 pt-7 pl-6 font-bold text-osmoverse-200">
        {t("store.allAppsHeader")}
      </div>
      <div className="container mx-auto py-3">
        <div className="grid grid-cols-3 gap-4 1.5md:grid-cols-2 md:grid-cols-1">
          {iterableData?.map((app, index) => {
            return (
              <AppDisplayCard
                key={app.title}
                title={app?.title}
                subtitle={app?.subtitle}
                imageUrl={app?.thumbnail_image_URL}
                twitterUrl={app?.twitter_URL}
                githubUrl={app?.github_URL}
                externalUrl={app?.external_URL}
                index={index}
              />
            );
          })}
        </div>
      </div>
      <div className="container mx-auto flex py-6 pl-6">
        <div className="flex flex-col pr-2" style={{ flexBasis: "35%" }}>
          <h6 className="font-semibold">{t("store.getFeatured")}</h6>
          <p className="pt-4 text-xs text-osmoverse-200">
            {t("store.featuredDescription")}
          </p>
        </div>
        <div className="flex w-48 items-center justify-center pl-6">
          <a
            className={buttonCVA({
              mode: "secondary",
            })}
            href="https://cosmos-ecosystem.webflow.io/submit"
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleApplyClick}
          >
            {t("store.applyButton")} &rarr;
          </a>
        </div>
      </div>
      <div className="flex w-full items-center overflow-x-auto rounded-lg bg-osmoverse-1000 px-8 py-6 text-osmoverse-400 2xl:gap-4 xl:gap-3 1.5lg:px-4 md:flex-col md:items-start md:gap-3 md:px-5 md:py-5">
        <span className="text-xs">{t("store.storeDisclaimer")}</span>
      </div>
    </main>
  );
};

export default AppStore;

export async function getStaticProps() {
  // The raw URL of the applications.json file in the GitHub repo
  const url =
    "https://raw.githubusercontent.com/osmosis-labs/apps-list/main/applications.json";

  const response = await fetch(url);
  const apps = await response.json();

  return {
    props: {
      apps,
    },
  };
}
