import { Popover } from "@headlessui/react";
import { isAssetNew } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo, useRef } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";

import { Icon } from "./icon";

const staticCategoryAssetImageSamples = {
  new: AssetLists.flatMap(({ assets }) => assets).reduce((acc, asset) => {
    if (
      asset.verified &&
      !asset.preview &&
      asset.listingDate &&
      isAssetNew(asset.listingDate) &&
      acc.length < 3
    ) {
      acc.push(asset.relative_image_url);
    }
    return acc;
  }, [] as string[]),
  defi: [
    "/tokens/generated/osmo.svg",
    "/tokens/generated/mars.svg",
    "/tokens/generated/lvn.svg",
  ],
  stablecoin: [
    "/tokens/generated/usdc.svg",
    "/tokens/generated/dai.svg",
    "/tokens/generated/usdt.svg",
  ],
  meme: [
    "/tokens/generated/pepe.svg",
    "/tokens/generated/shib.svg",
    "/tokens/generated/huahua.svg",
  ],
  ai: [
    "/tokens/generated/akt.svg",
    "/tokens/generated/fet.svg",
    "/tokens/generated/boot.svg",
  ],
  liquid_staking: [
    "/tokens/generated/stosmo.svg",
    "/tokens/generated/milktia.svg",
    "/tokens/generated/statom.svg",
  ],
  bridges: [
    "/tokens/generated/axl.svg",
    "/tokens/generated/w.png",
    "/tokens/generated/pica.svg",
  ],
  dweb: [
    "/tokens/generated/dvpn.svg",
    "/tokens/generated/fil.svg",
    "/tokens/generated/lore.svg",
  ],
  rwa: [
    "/tokens/generated/hash.svg",
    "/tokens/generated/cmdx.svg",
    "/tokens/generated/regen.svg",
  ],
  gaming: [
    "/tokens/generated/saga.svg",
    "/tokens/generated/xpla.svg",
    "/tokens/generated/pasg.png",
  ],
  oracles: [
    "/tokens/generated/pyth.svg",
    "/tokens/generated/link.svg",
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
    "/tokens/generated/mntl.svg",
  ],
  privacy: [
    "/tokens/generated/scrt.svg",
    "/tokens/generated/nyx.png",
    "/tokens/generated/dvpn.svg",
  ],
  built_on_osmosis: [
    "/tokens/generated/lvn.svg",
    "/tokens/generated/mars.svg",
    "/tokens/generated/mbrn.svg",
  ],
  sail_initiative: [
    "/tokens/generated/lab.png",
    "/tokens/generated/sail.png",
    "/tokens/generated/whale.svg",
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
      className="flex w-full place-content-between items-center py-3"
    >
      <div className="flex items-center gap-3">
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
                "group flex shrink-0 items-center gap-3 rounded-full border py-4 px-6 text-osmoverse-200 transition-all duration-150",
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
              <span>{t(`assets.categories.${category}`)}</span>
              <OverlappingAssetImages imageUrls={sampleImages} />
              {isSelected && (
                <Icon
                  className="text-osmoverse-600 transition-all duration-150 ease-out group-hover:text-osmoverse-200"
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
    <Popover className="relative">
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

const OverlappingAssetImages: FunctionComponent<{ imageUrls: string[] }> = ({
  imageUrls,
}) => (
  <div
    style={{
      width: `${imageUrls.slice(undefined, 4).length * 28}px`,
    }}
    className="relative flex h-fit items-center"
  >
    {imageUrls.map((url, index, urls) => (
      <div
        key={url}
        style={{
          marginLeft: `${index * 24}px`,
          zIndex: 50 + index,
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
