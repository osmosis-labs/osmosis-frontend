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
  useAmplitudeAnalytics,
  useDisclosure,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";

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
              <span className="body2 text-osmoverse-300">
                {availableBalance} {t("pool.available").toLowerCase()}
              </span>
              {onMax && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 rounded-5xl border border-osmoverse-700 py-1.5 px-3 disabled:pointer-events-none disabled:opacity-50"
                  onClick={onMax}
                  disabled={isMaxButtonDisabled}
                >
                  {isLoadingMaxButton && (
                    <Spinner className="!h-2.5 !w-2.5 text-wosmongton-300" />
                  )}
                  <span className="body2 text-wosmongton-300">Max</span>
                </button>
              )}
            </>
          )
        ) : null}
      </div>
    );
  }
);

const calcFontSize = (numChars: number, isMobile: boolean): string => {
  const sizeMapping: { [key: number]: string } = isMobile
    ? {
        9: "48px",
        15: "38px",
        24: "32px",
        100: "16px",
      }
    : {
        7: "48px",
        12: "38px",
        16: "28px",
        33: "24px",
        100: "16px",
      };

  for (const [key, value] of Object.entries(sizeMapping)) {
    if (numChars <= Number(key)) {
      return value;
    }
  }

  return "48px";
};

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
>(({ inputPrefix, inputValue, onInputChange, outputValue }, ref) => {
  const { isMobile } = useWindowSize();

  const fontSize = calcFontSize((inputValue ?? "").length, isMobile);

  return (
    <div
      className={`flex items-center overflow-visible`}
      style={{
        fontSize,
      }}
    >
      {inputPrefix}
      {outputValue || (
        <div className="transiiton-all w-full origin-left overflow-visible">
          <input
            ref={ref}
            className={`text-[${fontSize}] w-full bg-transparent font-h3 placeholder:text-osmoverse-600`}
            placeholder="0"
            onChange={onInputChange}
            value={inputValue}
          />
        </div>
      )}
    </div>
  );
});

const AssetFieldsetFooter = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex h-12 w-full items-center justify-between pb-4">
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
        page,
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
          <h5 className="max-w-[125px] truncate">{selectedCoinDenom}</h5>
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
