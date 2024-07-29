import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEventHandler, PropsWithChildren, ReactNode } from "react";

import { Icon } from "~/components/assets";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useDisclosure, useTranslation } from "~/hooks";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";

const AssetFieldset = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex flex-col">{children}</div>
);

const AssetFieldsetHeader = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex w-full items-center justify-between pt-3">
    {children}
  </div>
);

const AssetFieldsetHeaderLabel = ({ children }: PropsWithChildren<unknown>) =>
  children;

const AssetFieldsetHeaderBalance = ({
  onMax,
  availableBalance,
  className,
}: {
  onMax?: () => void;
  availableBalance?: ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "flex items-center gap-2 transition-opacity",
        className
      )}
    >
      {availableBalance && (
        <span className="body2 text-osmoverse-300">
          {availableBalance} {t("pool.available").toLowerCase()}
        </span>
      )}
      {onMax && (
        <button
          type="button"
          className="flex items-center justify-center rounded-5xl border border-osmoverse-700 py-1.5 px-3"
          onClick={onMax}
        >
          <span className="body2 text-wosmongton-300">Max</span>
        </button>
      )}
    </div>
  );
};

interface AssetFieldsetInputProps {
  inputPrefix?: ReactNode;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  inputValue?: string;
  outputValue?: ReactNode;
}

const AssetFieldsetInput = ({
  inputPrefix,
  inputValue,
  onInputChange,
  outputValue,
}: AssetFieldsetInputProps) => (
  <div className="flex items-center">
    {inputPrefix}
    {outputValue || (
      <input
        className="w-full bg-transparent text-h3 font-h3 placeholder:text-white-disabled placeholder:opacity-50"
        placeholder="0"
        onChange={onInputChange}
        value={inputValue}
      />
    )}
  </div>
);

const AssetFieldsetFooter = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex w-full items-center justify-between pb-4">
    {children}
  </div>
);

interface TokenSelectProps {
  selectableAssets?: (MinimalAsset | undefined)[];
  selectedCoinImageUrl?: string;
  selectedCoinDenom?: string;
  orderDirection?: string;
  onSelect?: (denom: string) => void;
  onSelectorClick?: () => void;
  isModalExternal?: boolean;
  fetchNextPageAssets?: () => void;
  hasNextPageAssets?: boolean;
  isFetchingNextPageAssets?: boolean;
}

const AssetFieldsetTokenSelector = ({
  selectableAssets,
  selectedCoinImageUrl,
  selectedCoinDenom,
  orderDirection,
  onSelect: onOriginalSelect,
  isModalExternal,
  onSelectorClick,
  fetchNextPageAssets,
  hasNextPageAssets,
  isFetchingNextPageAssets,
}: TokenSelectProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const {
    isOpen: isSelectOpen,
    onOpen: openSelect,
    onClose: closeSelect,
  } = useDisclosure();

  const router = useRouter();

  const onSelect = (tokenDenom: string) => {
    logEvent([
      EventName.Swap.dropdownAssetSelected,
      {
        tokenName: tokenDenom,
        isOnHome: router.pathname === "/",
        page: "Swap Page",
      },
    ]);
    onOriginalSelect?.(tokenDenom);
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-1 rounded-[64px] bg-osmoverse-850 py-3 pl-3 pr-4 transition-colors hover:bg-osmoverse-800"
        onClick={(e) => {
          if (onSelectorClick) return onSelectorClick();

          e.stopPropagation();
          if (
            !isModalExternal &&
            selectableAssets &&
            selectableAssets.length > 0
          ) {
            openSelect();
          }
        }}
      >
        <div className="flex items-center gap-3">
          {selectedCoinImageUrl && (
            <Image
              src={selectedCoinImageUrl}
              alt={`${selectedCoinDenom} image`}
              width={40}
              height={40}
              className="h-10 min-w-10 rounded-full"
            />
          )}
          <h5>{selectedCoinDenom}</h5>
        </div>
        <div className="flex h-6 w-6 items-center justify-center">
          <Icon
            id="chevron-down"
            width={16}
            height={16}
            className="text-osmoverse-400"
          />
        </div>
      </button>
      {!isModalExternal && selectableAssets && (
        <TokenSelectModalLimit
          headerTitle={
            orderDirection === "ask"
              ? t("limitOrders.selectAnAssetTo.sell")
              : t("limitOrders.selectAnAssetTo.buy")
          }
          isOpen={isSelectOpen}
          onClose={closeSelect}
          onSelect={onSelect}
          showSearchBox
          selectableAssets={selectableAssets}
          fetchNextPageAssets={fetchNextPageAssets}
          hasNextPageAssets={hasNextPageAssets}
          isFetchingNextPageAssets={isFetchingNextPageAssets}
        />
      )}
    </>
  );
};

export {
  AssetFieldset,
  AssetFieldsetFooter,
  AssetFieldsetHeader,
  AssetFieldsetHeaderBalance,
  AssetFieldsetHeaderLabel,
  AssetFieldsetInput,
  AssetFieldsetTokenSelector,
};
