import { Popover } from "@headlessui/react";
import classNames from "classnames";
import { FunctionComponent, useMemo, useRef } from "react";

import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";

import { CustomClasses } from "../types";
import { Icon } from "./icon";

const staticCategoryAssetImageSamples = {
  defi: [
    "/tokens/generated/osmo.svg",
    "/tokens/generated/usdy.svg",
    "/tokens/generated/dydx.svg",
  ],
  privacy: [
    "/tokens/generated/nam.svg",
    "/tokens/generated/um.svg",
    "/tokens/generated/scrt.svg",
  ],
  ai: [
    "/tokens/generated/akt.svg",
    "/tokens/generated/fet.svg",
    "/tokens/generated/orai.svg",
  ],
  meme: [
    "/tokens/generated/doge.svg",
    "/tokens/generated/huahua.svg",
    "/tokens/generated/ion.svg",
  ],
  liquid_staking: [
    "/tokens/generated/stosmo.svg",
    "/tokens/generated/milktia.svg",
    "/tokens/generated/statom.svg",
  ],
  stablecoin: [
    "/tokens/generated/usdc.svg",
    "/tokens/generated/usdt.svg",
    "/tokens/generated/eure.svg",
  ],
  bridges: [
    "/tokens/generated/axl.svg",
    "/tokens/generated/coreum.svg",
    "/tokens/generated/grav.svg",
  ],
  dweb: [
    "/tokens/generated/akt.svg",
    "/tokens/generated/p2p.svg",
    "/tokens/generated/cheq.svg",
  ],
  rwa: [
    "/tokens/generated/hash.svg",
    "/tokens/generated/om.svg",
    "/tokens/generated/paxg.atom.svg",
  ],
  gaming: [
    "/tokens/generated/saga.svg",
    "/tokens/generated/pasg.svg",
    "/tokens/generated/xpla.svg",
  ],
  oracles: [
    "/tokens/generated/link.svg",
    "/tokens/generated/pyth.svg",
    "/tokens/generated/band.svg",
  ],
  social: [
    "/tokens/generated/btsg.svg",
    "/tokens/generated/like.svg",
    "/tokens/generated/dsm.svg",
  ],
  nft_protocol: [
    "/tokens/generated/stars.svg",
    "/tokens/generated/flix.svg",
    "/tokens/generated/lab.svg",
  ],
  built_on_osmosis: [
    "/tokens/generated/lvn.svg",
    "/tokens/generated/mars.svg",
    "/tokens/generated/mbrn.svg",
  ],
};

export const AssetCategoriesSelectors: FunctionComponent<{
  selectedCategory?: string;
  /** Categories that can still be selected, but aren't available from this control. */
  hiddenCategories?: string[];
  /** Client side categories need to be queried from client, so image sampled need to be provided. */
  clientCategoryImageSamples?: Record<string, string[]>;
  onSelectCategory: (category: string) => void;
  unselectCategory: () => void;
}> = ({
  selectedCategory,
  hiddenCategories,
  clientCategoryImageSamples = {},
  onSelectCategory,
  unselectCategory,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();

  const divRef = useRef<HTMLDivElement>(null);

  /** Static sample images combined with dynamic */
  const categoryAssetSampleImages: Record<string, string[]> = useMemo(
    () => ({
      ...staticCategoryAssetImageSamples,
      ...clientCategoryImageSamples,
    }),
    [clientCategoryImageSamples]
  );

  /** Selected moved to front of list of categories. */
  const categories = useMemo(
    () =>
      selectedCategory
        ? Object.keys(categoryAssetSampleImages)
            .slice()
            .sort((a, b) =>
              a === selectedCategory ? -1 : b === selectedCategory ? 1 : 0
            )
        : Object.keys(categoryAssetSampleImages).slice(),
    [categoryAssetSampleImages, selectedCategory]
  );

  const { visibleCategories, dropdownCategories } = useMemo(() => {
    const visibleCount =
      width >= Breakpoint.xl
        ? 4
        : width < Breakpoint.xl && width >= Breakpoint.lg
        ? 3 // some category names can be very long, so err on the side of caution
        : width < Breakpoint.lg && width >= Breakpoint.md
        ? 2
        : 1;

    const visibleCategories = categories.slice(0, visibleCount);
    const dropdownCategories = categories.slice(visibleCount);
    return { visibleCategories, dropdownCategories };
  }, [width, categories]);

  return (
    <div
      ref={divRef}
      className="flex w-full place-content-between items-center gap-1 py-3"
    >
      <div className="no-scrollbar flex w-full items-center gap-3 overflow-x-scroll">
        {visibleCategories.map((category) => {
          const isSelected = selectedCategory === category;
          const sampleImages = getSampleImages(
            categoryAssetSampleImages,
            category
          );

          if (hiddenCategories?.includes(category) && !isSelected) return null;

          return (
            <button
              key={category}
              aria-label={category.replace("_", " ").replace("-", " ")}
              className={classNames(
                "group flex max-w-full shrink-0 items-center gap-3 rounded-full border py-4 px-6 text-osmoverse-200 transition-all duration-150 md:gap-2",
                "hover:border-osmoverse-200 hover:text-white-high",
                "focus:border-wosmongton-400 focus:text-osmoverse-200",
                "active:opacity-50",
                {
                  "border-osmoverse-800 bg-osmoverse-800": isSelected,
                  "border-osmoverse-700": !isSelected,
                }
              )}
              onClick={() => {
                if (isSelected) {
                  unselectCategory();
                } else {
                  if (divRef.current) {
                    divRef.current.scrollLeft = 0;
                  }
                  onSelectCategory(category);
                }
              }}
            >
              <span className="overflow-x-hidden text-ellipsis whitespace-nowrap md:w-full">
                {t(`assets.categories.${category}`)}
              </span>
              <OverlappingAssetImages
                className="md:hidden"
                imageUrls={sampleImages}
              />
              {isSelected && (
                <Icon
                  className="shrink-0 text-osmoverse-600 transition-all duration-150 ease-out group-hover:text-osmoverse-200"
                  id="x-circle"
                  height={16}
                  width={17}
                />
              )}
            </button>
          );
        })}
      </div>
      <CategoriesDropdown
        selectableCategoryKeys={dropdownCategories}
        selectedCategoryKey={selectedCategory}
        onSelectCategory={onSelectCategory}
        categoryAssetSampleImages={categoryAssetSampleImages}
        hiddenCategories={hiddenCategories}
      />
    </div>
  );
};

const CategoriesDropdown: FunctionComponent<{
  selectableCategoryKeys: string[];
  selectedCategoryKey?: string;
  onSelectCategory: (key: string) => void;
  categoryAssetSampleImages: Record<string, string[]>;
  hiddenCategories?: string[];
}> = ({
  selectableCategoryKeys,
  selectedCategoryKey,
  onSelectCategory,
  categoryAssetSampleImages,
  hiddenCategories,
}) => {
  const { t } = useTranslation();

  return (
    <Popover className="relative shrink-0">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              "flex items-center gap-2 rounded-full bg-osmoverse-850 px-6 py-4",
              "text-wosmongton-200 transition-colors duration-150 ease-out hover:text-white-full",
              {
                "text-white-full": open,
              }
            )}
          >
            {t("assets.categories.more")}
            <Icon
              className={classNames(
                "transition-transform duration-150 ease-out",
                open && "rotate-180"
              )}
              id="chevron-down"
              width={16}
              height={16}
            />
          </Popover.Button>

          <Popover.Panel className="absolute right-0 z-50 mt-1">
            {({ close }) => (
              <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-825 p-2">
                {selectableCategoryKeys.map((category) => {
                  const isSelected = selectedCategoryKey === category;
                  const sampleImages = getSampleImages(
                    categoryAssetSampleImages,
                    category
                  );

                  if (hiddenCategories?.includes(category) && !isSelected)
                    return null;

                  return (
                    <button
                      key={category}
                      className="body2 flex place-content-between items-center gap-2 rounded-full px-4 py-3 text-osmoverse-200 hover:bg-osmoverse-700"
                      onClick={() => {
                        onSelectCategory(category);
                        close();
                      }}
                    >
                      <span className="whitespace-nowrap">
                        {t(`assets.categories.${category}`)}
                      </span>
                      <OverlappingAssetImages imageUrls={sampleImages} />
                    </button>
                  );
                })}
              </div>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

const OverlappingAssetImages: FunctionComponent<
  { imageUrls: string[] } & CustomClasses
> = ({ imageUrls, className }) => (
  <div
    style={{
      width: `${imageUrls.slice(undefined, 4).length * 28}px`,
    }}
    className={classNames("relative flex h-fit items-center", className)}
  >
    {imageUrls.map((url, index, urls) => (
      <div
        key={url}
        style={{
          marginLeft: `${index * 24}px`,
          zIndex: 40 + index,
        }}
        className={classNames(
          "absolute flex h-8 w-8 items-center justify-center",
          {
            "shrink-0": index > 0,
          }
        )}
      >
        {index > 2 ? (
          <div className="body1 pl-4 text-white-mid">{`+${
            urls.length - 3
          }`}</div>
        ) : url ? (
          <img src={url} alt={url} width={32} height={32} />
        ) : (
          <img
            src="/icons/question-mark.svg"
            alt="no token icon"
            width={32}
            height={32}
          />
        )}
      </div>
    ))}
  </div>
);

function getSampleImages(
  categoryAssetSampleImages: Record<string, string[]>,
  category: string
) {
  const samples = categoryAssetSampleImages[category];
  return samples ?? [];
}
