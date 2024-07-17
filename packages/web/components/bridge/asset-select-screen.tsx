import { MinimalAsset } from "@osmosis-labs/types";
import { truncateString } from "@osmosis-labs/utils";
import classNames from "classnames";
import debounce from "debounce";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";
import { useMount } from "react-use";

import { Icon } from "~/components/assets";
import { NoSearchResultsSplash, SearchBox } from "~/components/input";
import { Intersection } from "~/components/intersection";
import { Spinner } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import {
  MainnetAssetSymbols,
  MainnetVariantGroupKeys,
  TestnetAssetSymbols,
  TestnetVariantGroupKeys,
} from "~/config/generated/asset-lists";
import { useTranslation, useWindowSize } from "~/hooks";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { ActivateUnverifiedTokenConfirmation } from "~/modals/activate-unverified-token-confirmation";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings/unverified-assets";
import { formatPretty } from "~/utils/formatter";
import { api, RouterOutputs } from "~/utils/trpc";

const variantsNotToBeExcluded = [
  "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
] satisfies (MainnetVariantGroupKeys | TestnetVariantGroupKeys)[];
const prioritizedDenoms = [
  "USDC",
  "ETH",
  "SOL",
  "USDT",
  "WBTC",
  "ATOM",
  "TIA",
] satisfies (MainnetAssetSymbols | TestnetAssetSymbols)[];

// Deprioritize native assets. They can still be bridged, but we avoid
// showing them at the top of the list
const deprioritizedDenoms = ["OSMO", "ION"] satisfies (
  | MainnetAssetSymbols
  | TestnetAssetSymbols
)[];

interface AssetSelectScreenProps {
  type: "deposit" | "withdraw";
  onSelectAsset: (
    asset: RouterOutputs["edge"]["assets"]["getImmersiveBridgeAssets"]["items"][number]
  ) => void;
}

export const AssetSelectScreen = observer(
  ({ type, onSelectAsset }: AssetSelectScreenProps) => {
    const { accountStore, userSettings } = useStore();
    const { showPreviewAssets } = useShowPreviewAssets();
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();

    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const [search, setSearch] = useState("");
    const [assetToActivate, setAssetToActivate] = useState<MinimalAsset | null>(
      null
    );

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldShowUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
      api.edge.assets.getImmersiveBridgeAssets.useInfiniteQuery(
        {
          type,
          search: Boolean(search)
            ? {
                query: search,
              }
            : undefined,
          userOsmoAddress: wallet?.address,
          includePreview: showPreviewAssets,
          variantsNotToBeExcluded,
          prioritizedDenoms,
          deprioritizedDenoms,
          limit: 100, // items per page
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          initialCursor: 0,

          // avoid blocking
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      );

    const assets = useMemo(
      () => data?.pages.flatMap((page) => page?.items) ?? [],
      [data?.pages]
    );
    const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;
    const noSearchResults = Boolean(search) && !isLoading && !assets.length;

    // focus search on modal open
    const searchBoxRef = useRef<HTMLInputElement>(null);
    useMount(() => setTimeout(() => searchBoxRef.current?.focus(), 0));

    return (
      <>
        <ActivateUnverifiedTokenConfirmation
          coinDenom={assetToActivate?.coinDenom}
          coinImageUrl={assetToActivate?.coinImageUrl}
          isOpen={Boolean(assetToActivate)}
          onConfirm={() => {
            if (!assetToActivate) return;
            showUnverifiedAssetsSetting?.setState({
              showUnverifiedAssets: true,
            });
            onSelectAsset(assetToActivate);
          }}
          onRequestClose={() => {
            setAssetToActivate(null);
          }}
        />

        <div className="text-center text-h5 font-h5 md:text-h6 md:font-h6">
          {t(
            type === "deposit"
              ? "transfer.assetSelectScreen.titleDeposit"
              : "transfer.assetSelectScreen.titleWithdraw"
          )}
        </div>

        <div className="sticky top-0 z-[1000] w-full flex-shrink-0 bg-osmoverse-900 py-3">
          <SearchBox
            ref={searchBoxRef}
            onInput={debounce((nextValue) => {
              setSearch(nextValue);
            }, 300)}
            className="md:w-full"
            placeholder={t("transfer.assetSelectScreen.searchAssets")}
            size={isMobile ? "small" : "full"}
          />
        </div>

        <div className="flex flex-col gap-1">
          {noSearchResults ? (
            <NoSearchResultsSplash className="pt-3" query={search} />
          ) : isLoading ? (
            <div className="self-center pt-3">
              <Spinner />
            </div>
          ) : (
            <>
              {assets.map((asset) => (
                <button
                  key={asset.coinMinimalDenom}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50 md:py-2 md:px-0"
                  onClick={() => {
                    if (!shouldShowUnverifiedAssets && !asset.isVerified) {
                      return setAssetToActivate(asset);
                    }
                    onSelectAsset(asset);
                  }}
                >
                  <div
                    className={classNames("flex items-center gap-3", {
                      "opacity-40":
                        !shouldShowUnverifiedAssets && !asset.isVerified,
                    })}
                  >
                    <Image
                      src={asset.coinImageUrl ?? "/"}
                      width={isMobile ? 32 : 48}
                      height={isMobile ? 32 : 48}
                      alt={`${asset.coinDenom} asset image`}
                    />
                    <span className="flex flex-col text-left">
                      <span className="subtitle1 md:body2">
                        {truncateString(asset.coinName, 22)}
                      </span>
                      <span className="body2 md:caption text-osmoverse-300">
                        {asset.coinDenom}
                      </span>
                    </span>
                  </div>
                  {!asset.isVerified && shouldShowUnverifiedAssets && (
                    <Tooltip
                      content={t("components.selectToken.unverifiedAsset")}
                    >
                      <Icon
                        id="alert-triangle"
                        className="h-5 w-5 text-osmoverse-400"
                      />
                    </Tooltip>
                  )}
                  {!shouldShowUnverifiedAssets && !asset.isVerified && (
                    <p className="caption whitespace-nowrap text-wosmongton-200">
                      {t("components.selectToken.clickToActivate")}
                    </p>
                  )}
                  {asset.amount &&
                    asset.isVerified &&
                    asset.usdValue &&
                    asset.amount.toDec().isPositive() && (
                      <div className="flex flex-col text-right">
                        <p className="button">
                          {formatPretty(asset.amount.hideDenom(true), {
                            maxDecimals: 6,
                          })}
                        </p>
                        <span className="caption font-medium text-osmoverse-400">
                          {asset.usdValue.toString()}
                        </span>
                      </div>
                    )}
                </button>
              ))}
              <Intersection
                className="-mt-20"
                onVisible={() => {
                  if (canLoadMore) {
                    fetchNextPage();
                  }
                }}
              />
              {isFetchingNextPage && (
                <div className="self-center pt-3">
                  <Spinner />
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }
);
