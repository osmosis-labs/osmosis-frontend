import Fuse from "fuse.js";
import React from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { HeroCard } from "~/components/cards";
import AppDisplayCard from "~/components/cards/app-display-card";
import { SearchBox } from "~/components/input";

type appDataType = {
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
  apps: App[];
};

const dummyData = [
  {
    title: "Mars",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
    twitter_URL: "https://www.google.com",
    github_URL: "https://www.google.com",
    featured: true,
  },
  {
    title: "Saturn",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
    twitter_URL: "https://www.google.com",
    github_URL: "https://www.google.com",
  },
  {
    title: "Neptune",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
  },
  {
    title: "Uranus",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
  },
  ,
  {
    title: "Jupiter",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
    twitter_URL: "https://www.google.com",
    github_URL: "https://www.google.com",
  },
  {
    title: "Venus",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    thumbnail_image_URL:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    external_URL: "https://www.google.com",
  },
];

export const AppStore: React.FC<AppStoreProps> = ({ apps }) => {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [fuzzySearchResults, setFuzzySearchResults] = React.useState<
    appDataType[]
  >([]);

  const t = useTranslation();

  const options = {
    keys: ["title"],
  };
  const fuse = new Fuse(dummyData, options);

  const handleApplyClick = () => {
    const url = "https://tally.so/";
    window.open(url, "_blank");
  };

  const handleSearchInput = (value: string) => {
    const searchResults = fuse.search(value);
    const appDataResults: appDataType[] = searchResults.map(
      (result) => result.item as appDataType
    );

    setSearchValue(value);
    setFuzzySearchResults(appDataResults);
  };

  const iterableData = searchValue ? fuzzySearchResults : dummyData;

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 py-3 md:px-3">
      <div className="flex justify-between pl-6">
        <div style={{ flexBasis: "55%" }}>
          <h4 className="pb-2 text-h4 font-h4 text-wosmongton-100">
            {t("store.headerTitle")}
          </h4>
          <span className="body2 text-osmoverse-200">
            {t("store.headerSubtitle")}
          </span>
        </div>
        <SearchBox
          placeholder={t("store.searchPlaceholder")}
          onInput={handleSearchInput}
          className="self-end"
          size="long"
        />
      </div>
      <HeroCard
        title="Mars"
        subtitle="Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none."
        imageUrl="https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg"
        fallbackImageUrl="https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg"
        githubUrl="https://www.google.com"
        twitterUrl="https://www.nytimes.com"
        externalUrl="https://www.google.com"
        mediumUrl="https://www.google.com"
      />
      <div className="body2 mb-2 pt-7 pl-6 font-bold text-osmoverse-200">
        All apps
      </div>
      <div className="container mx-auto py-3">
        <div className="grid grid-cols-3 gap-4">
          {iterableData.map((data, index) => {
            return (
              <AppDisplayCard
                key={index}
                title={data?.title}
                subtitle={data?.subtitle}
                imageUrl={data?.thumbnail_image_URL}
                twitterUrl={data?.twitter_URL}
                githubUrl={data?.github_URL}
                externalUrl={data?.external_URL}
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
          <Button mode="secondary" size="sm" onClick={handleApplyClick}>
            {t("store.applyButton")} &rarr;
          </Button>
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
