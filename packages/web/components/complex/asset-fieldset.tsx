import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ChangeEventHandler,
  forwardRef,
  PropsWithChildren,
  ReactNode,
} from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { EventName, EventPage } from "~/config";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useDisclosure,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";
import { calcFontSize } from "~/utils/formatter";

const AssetFieldset = ({ children }: PropsWithChildren<unknown>) => (
  <>{children}</>
);

const AssetFieldsetHeader = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex w-full items-center justify-between pt-3">
    {children}
  </div>
);

const AssetFieldsetHeaderLabel = ({ children }: PropsWithChildren<unknown>) =>
  children;

const AssetFieldsetHeaderBalance = observer(
  ({
    onMax,
    availableBalance,
    className,
    showAddFundsButton,
    openAddFundsModal,
    isMaxButtonDisabled,
    isLoadingMaxButton,
  }: {
    onMax?: () => void;
    availableBalance?: ReactNode;
    className?: string;
    showAddFundsButton?: boolean;
    openAddFundsModal?: () => void;
    isMaxButtonDisabled?: boolean;
    isLoadingMaxButton?: boolean;
  }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();

    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    return (
      <div
        className={classNames(
          "flex items-center gap-2 transition-opacity",
          className
        )}
      >
        {wallet?.isWalletConnected ? (
          showAddFundsButton ? (
            <button
              type="button"
              onClick={openAddFundsModal}
              className="body2 flex items-center justify-center rounded-5xl bg-wosmongton-700 py-1.5 px-3"
            >
              {t("limitOrders.addFunds")}
            </button>
          ) : (
            <>
              <span className="body2 sm:caption text-right text-osmoverse-300">
                {availableBalance} {t("pool.available").toLowerCase()}
              </span>
              {onMax && (
                <button
                  type="button"
                  className="flex h-8 items-center justify-center gap-1 rounded-5xl border border-osmoverse-700 py-1 px-3 disabled:pointer-events-none disabled:opacity-50"
                  onClick={onMax}
                  disabled={isMaxButtonDisabled}
                >
                  {isLoadingMaxButton && (
                    <Spinner className="!h-2.5 !w-2.5 text-wosmongton-300" />
                  )}
                  <span className="body2 sm:caption text-wosmongton-300">
                    Max
                  </span>
                </button>
              )}
            </>
          )
        ) : null}
      </div>
    );
  }
);

interface AssetFieldsetInputProps {
  inputPrefix?: ReactNode;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  inputValue?: string;
  outputValue?: ReactNode;
  page?: EventPage;
}

const AssetFieldsetInput = forwardRef<
  HTMLInputElement,
  AssetFieldsetInputProps
>(({ inputPrefix, inputValue, onInputChange, outputValue, ...rest }, ref) => {
  const { isMobile } = useWindowSize(Breakpoint.sm);
  const fontSize = calcFontSize((inputValue ?? "").length, isMobile);
  return (
    <div
      className="flex h-[72px] flex-1 items-center overflow-visible text-h3 font-h3 sm:h-[48px] sm:text-[30px] sm:font-h5"
      style={{
        fontSize: !!inputValue ? fontSize : undefined,
      }}
    >
      {inputPrefix}
      {outputValue || (
        <input
          ref={ref}
          className="w-full flex-1 bg-transparent placeholder:text-osmoverse-600"
          style={{
            font: "inherit",
          }}
          placeholder="0"
          onChange={onInputChange}
          value={inputValue}
          inputMode="numeric"
          {...rest}
        />
      )}
    </div>
  );
});

const AssetFieldsetFooter = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex h-12 w-full items-start justify-between pb-4">
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
  isLoadingSelectAssets?: boolean;
  page?: EventPage;
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
  page = "Swap Page",
  isLoadingSelectAssets,
  ...rest
}: TokenSelectProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const { isMobile } = useWindowSize(Breakpoint.sm);

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
        page,
      },
    ]);
    onOriginalSelect?.(tokenDenom);
  };

  return (
    <>
      <button
        type="button"
        className="flex max-w-[50%] items-center gap-1 rounded-[64px] bg-osmoverse-850 py-3 pl-3 pr-4 transition-colors hover:bg-osmoverse-800 sm:px-3"
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
        {...rest}
      >
        {selectedCoinImageUrl && (
          <Image
            src={selectedCoinImageUrl}
            alt={`${selectedCoinDenom} image`}
            width={isMobile ? 24 : 40}
            height={isMobile ? 24 : 40}
            className="h-10 w-10 rounded-full sm:h-6 sm:w-6"
          />
        )}
        <span className="ml-2 truncate text-h5 font-h5 sm:ml-1 sm:text-h6 sm:font-h6">
          {selectedCoinDenom}
        </span>
        <div className="flex h-6 w-6 items-center justify-center">
          <Icon
            id="chevron-down"
            width={isMobile ? 12 : 16}
            height={isMobile ? 12 : 16}
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
          isLoadingSelectAssets={isLoadingSelectAssets}
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
