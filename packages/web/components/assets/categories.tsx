import { AssetCategories, Category, isAssetNew } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation } from "~/hooks";

const categoryAssetSampleImages = {
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
    "/tokens/generated/ion.svg",
    "/tokens/generated/mars.svg",
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
  liquid_staking: [
    "/tokens/generated/stosmo.svg",
    "/tokens/generated/milktia.svg",
    "/tokens/generated/statom.svg",
  ],
};

export const AssetCategoriesSelectors: FunctionComponent<{
  selectedCategory?: Category;
  onSelectCategory: (category: Category) => void;
  unselectCategory: () => void;
}> = ({ selectedCategory, onSelectCategory, unselectCategory }) => {
  const { t } = useTranslation();

  return (
    <div className="no-scrollbar flex w-full items-center gap-3 overflow-scroll py-3">
      {AssetCategories.map((category) => {
        const sampleAssets = categoryAssetSampleImages[category] ?? [];

        return (
          <button
            key={category}
            className={classNames(
              "flex shrink-0 items-center gap-4 rounded-full border py-4 px-6",
              {
                "border-wosmongton-400": selectedCategory === category,
                "border-osmoverse-600": selectedCategory !== category,
              }
            )}
            onClick={() => {
              if (selectedCategory === category) {
                unselectCategory();
              } else {
                onSelectCategory(category);
              }
            }}
          >
            <span>{t(`assets.categories.${category}`)}</span>
            <div
              style={{
                width: `${sampleAssets.slice(undefined, 4).length * 28}px`,
              }}
              className="relative flex h-fit items-center"
            >
              {sampleAssets.map((coinImageUrl, index, assets) => (
                <div
                  key={coinImageUrl}
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
                      assets.length - 3
                    }`}</div>
                  ) : coinImageUrl ? (
                    <img
                      src={coinImageUrl}
                      alt={coinImageUrl}
                      width={32}
                      height={32}
                    />
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
          </button>
        );
      })}
    </div>
  );
};
