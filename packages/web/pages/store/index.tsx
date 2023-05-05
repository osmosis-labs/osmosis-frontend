import Fuse from "fuse.js";
import React from "react";

import { Button } from "~/components/buttons";
import { HeroCard } from "~/components/cards";
import AppDisplayCard from "~/components/cards/app-display-card";
import { SearchBox } from "~/components/input";

type appDataType = {
  title: string;
  subtitle: string;
  imageUrl: string;
  externalURL: string;
  fallbackImageUrl?: string;
  twitterUrl?: string;
  gitHubUrl?: string;
  featured?: boolean;
};

const dummyData = [
  {
    title: "Mars",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
    twitterUrl: "https://www.google.com",
    gitHubUrl: "https://www.google.com",
    featured: true,
  },
  {
    title: "Saturn",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
    twitterUrl: "https://www.google.com",
    gitHubUrl: "https://www.google.com",
  },
  {
    title: "Neptune",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
  },
  {
    title: "Uranus",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
  },
  ,
  {
    title: "Jupiter",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
    twitterUrl: "https://www.google.com",
    gitHubUrl: "https://www.google.com",
  },
  {
    title: "Venus",
    subtitle:
      "Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none.",
    imageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    fallbackImageUrl:
      "https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg",
    externalURL: "https://www.google.com",
  },
];

export const AppStore = () => {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [fuzzySearchResults, setFuzzySearchResults] = React.useState<
    appDataType[]
  >([]);
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
      <div className="flex justify-between">
        <div style={{ flexBasis: "55%" }}>
          <h4 className="pb-2 text-h4 font-h4 text-wosmongton-100">
            Supercharge your experience
          </h4>
          <span className="body2 text-osmoverse-200">
            Trading is just the first step. Put your assets to work and
            accomplish so much more with leverage, vaults, and beyond.
          </span>
        </div>
        <SearchBox
          placeholder="Search"
          onInput={handleSearchInput}
          className="w-300px self-end"
        />
      </div>
      <HeroCard
        title="Mars"
        subtitle="Lend, borrow and earn with an autonomous credit protocol in the Cosmos universe. Open to all, closed to none."
        imageUrl="https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg"
        fallbackImageUrl="https://www.shutterstock.com/image-illustration/landscape-on-planet-mars-scenic-600w-1104793244.jpg"
      />
      <div className="body2 mb-2 pt-7 font-bold text-osmoverse-200">
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
                imageUrl={data?.imageUrl}
                twitterUrl={data?.externalURL}
                githubUrl={data?.externalURL}
                externalUrl={data?.externalURL}
              />
            );
          })}
        </div>
      </div>
      <div className="container mx-auto flex py-6">
        <div className="flex flex-col pr-2" style={{ flexBasis: "35%" }}>
          <h6 className="font-semibold">Get featured</h6>
          <p className="body2 pt-5 text-osmoverse-200">
            Launch on the app store and get access to thousands of users. If you
            want to get listed or featured, reach out and we’ll be in touch.
          </p>
        </div>
        <div className="flex w-48 items-center justify-center pl-6">
          <Button mode="secondary" size="sm" onClick={handleApplyClick}>
            Apply {"->"}
          </Button>
        </div>
      </div>
      <div className="flex w-full items-center overflow-x-auto rounded-[32px] bg-osmoverse-1000 px-8 py-6 text-osmoverse-400 2xl:gap-4 xl:gap-3 1.5lg:px-4 md:flex-col md:items-start md:gap-3 md:px-5 md:py-5">
        <span className="text-xxs">
          Certain content has been prepared by third parties not affiliated with
          Osmosis Labs or any of its affiliates and Osmosis Labs is not
          responsible for such content. Osmosis Labs is not liable for any
          errors or delays in content, or for any actions taken in reliance on
          any content. Information is provided for informational purposes only
          and is not investment advice. This is not a recommendation to buy or
          sell a particular digital asset or to employ a particular investment
          strategy. Osmosis Labs makes no representation on the accuracy,
          suitability, or validity of any information provided or for a
          particular asset. Prices shown are for illustrative purposes only.
          Actual cryptocurrency prices and associated stats may vary. Data
          presented may reflect assets traded on Osmosis Labs’s exchange and
          select other cryptocurrency exchanges.
        </span>
      </div>
    </main>
  );
};

export default AppStore;
