import { Dec, PricePretty } from "@keplr-wallet/unit";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { useState } from "react";

import { MenuToggle } from "~/components/control";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import {
  Screen,
  ScreenGoBackButton,
  ScreenManager,
} from "~/components/screen-manager";
import { useTranslation } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

interface ShareOfBalanceOption {
  id: string;
  value: string;
}
const shareOfBalanceOptions: ShareOfBalanceOption[] = [
  {
    id: "5",
    value: "5",
  },
  {
    id: "10",
    value: "10",
  },
  {
    id: "20",
    value: "20",
  },
];

type SpendLimitViews = "fixed-amount" | "share-of-balance";
interface SpendLimitScreenProps extends OneClickTradingBaseScreenProps {
  subtitle?: string;
}

export const SpendLimitScreen = ({
  transaction1CTParams,
  setTransaction1CTParams,
  subtitle,
}: SpendLimitScreenProps) => {
  const { t } = useTranslation();
  const { accountStore, chainStore } = useStore();
  const [selectedView, setSelectedView] =
    useState<SpendLimitViews>("fixed-amount");

  const [fixedAmountValue, setFixedAmountValue] = useState(
    trimPlaceholderZeros(transaction1CTParams?.spendLimit.toDec().toString(2))
  );
  const [previousShareOfBalanceValue, setPreviousShareOfBalanceValue] =
    useState("25");
  const [shareOfBalance, setShareOfBalance] =
    useControllableState<ShareOfBalanceOption>({
      defaultValue: shareOfBalanceOptions[0],
      onChange: (nextShareOfBalance) => {
        if (nextShareOfBalance.id === "manual") {
          setPreviousShareOfBalanceValue(nextShareOfBalance.value);
        }
      },
    });

  const isManualShareOfBalance = shareOfBalance.id === "manual";

  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { data: userAssetsBreakdown, isLoading: isLoadingUserAssetsBreakdown } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      {
        userOsmoAddress: account?.address as string,
      },
      {
        enabled: Boolean(account) && Boolean(account?.address),
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const parseFixedValue = (value: string) => {
    return value.replace("$", "");
  };

  const formatFixedValue = (value: string) => {
    return `$${value}`;
  };

  const parseShareOfBalance = (value: string) => {
    return value.replace("%", "");
  };

  const formatShareOfBalance = (value: string) => {
    return `${value}%`;
  };

  return (
    <>
      <ScreenGoBackButton
        onClick={() => {
          setTransaction1CTParams((previousParams) => {
            if (!previousParams) throw new Error("1CT Params must be set");

            if (selectedView === "fixed-amount") {
              return {
                ...previousParams,
                spendLimit: new PricePretty(
                  DEFAULT_VS_CURRENCY,
                  new Dec(fixedAmountValue)
                ),
              };
            }

            return {
              ...previousParams,
              spendLimit: new PricePretty(
                DEFAULT_VS_CURRENCY,
                new Dec(!shareOfBalance?.value ? 0 : shareOfBalance.value)
                  .quo(new Dec(100))
                  .mul(
                    userAssetsBreakdown?.aggregatedValue.toDec() ?? new Dec(0)
                  )
              ),
            };
          });
        }}
        className="absolute top-7 left-7"
      />
      <div className="flex flex-col items-center gap-6 px-16 ">
        <div>
          <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
            {t("oneClickTrading.settings.spendLimitTitle")}
          </h1>
          {!isNil(subtitle) && (
            <p className="text-body2 text-osmoverse-300">{subtitle}</p>
          )}
        </div>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.spendLimitScreen.spendLimitDescription")}
        </p>
        {!!account?.address && (
          <MenuToggle
            options={
              [
                {
                  id: "fixed-amount",
                  display: t(
                    "oneClickTrading.settings.spendLimitScreen.fixedAmount"
                  ),
                },
                {
                  id: "share-of-balance",
                  display: t(
                    "oneClickTrading.settings.spendLimitScreen.shareOfBalance"
                  ),
                },
              ] as { id: SpendLimitViews; display: string }[]
            }
            selectedOptionId={selectedView}
            onSelect={(optionId) =>
              setSelectedView(optionId as SpendLimitViews)
            }
            classes={{
              root: "max-w-xs w-full",
            }}
          />
        )}

        <ScreenManager currentScreen={selectedView}>
          <Screen screenName="fixed-amount">
            <InputBox
              rightEntry
              currentValue={formatFixedValue(fixedAmountValue)}
              onInput={(nextValue) => {
                const parsedValue = parseFixedValue(nextValue);
                if (!isNumeric(parsedValue) && parsedValue !== "") return;
                setFixedAmountValue(parseFixedValue(nextValue));
              }}
              onBlur={() => {
                /**
                 * Value cannot be less than or equal to 0
                 */
                if (Number(fixedAmountValue) <= 0) {
                  setFixedAmountValue("1");
                }
              }}
              trailingSymbol={
                <span className="ml-2 text-body1 font-body1 text-osmoverse-300">
                  USD
                </span>
              }
            />
          </Screen>
          <Screen screenName="share-of-balance">
            <ul className="mt-3 flex w-full gap-x-3">
              {shareOfBalanceOptions.map(({ id, value }) => {
                return (
                  <li
                    key={value}
                    className={classNames(
                      "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-osmoverse-700",
                      {
                        "border-2 border-wosmongton-200":
                          id === shareOfBalance.id,
                      }
                    )}
                    onClick={() => {
                      setShareOfBalance({
                        id,
                        value,
                      });
                    }}
                  >
                    <button>{formatShareOfBalance(value)}</button>
                  </li>
                );
              })}
              <li className="w-full">
                <label
                  className={classNames(
                    "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg",
                    isManualShareOfBalance
                      ? "border-2 border-wosmongton-200 text-white-high"
                      : "text-osmoverse-500",
                    isManualShareOfBalance
                      ? shareOfBalance.value === ""
                        ? "bg-missionError"
                        : "bg-osmoverse-900"
                      : "bg-osmoverse-900"
                  )}
                >
                  <InputBox
                    type="number"
                    className="w-fit bg-transparent px-0"
                    inputClassName={classNames(
                      "bg-transparent text-center",
                      !isManualShareOfBalance
                        ? "text-osmoverse-500"
                        : "text-white-high"
                    )}
                    style="no-border"
                    currentValue={
                      isManualShareOfBalance
                        ? shareOfBalance.value
                        : previousShareOfBalanceValue
                    }
                    onInput={(nextValue) => {
                      const parsedValue = parseShareOfBalance(nextValue);
                      if (!isNumeric(parsedValue) && parsedValue !== "") return;
                      setShareOfBalance({
                        id: "manual",
                        value: parsedValue,
                      });
                    }}
                    onFocus={() => {
                      const parsedValue = parseShareOfBalance(
                        shareOfBalance.value
                      );
                      return setShareOfBalance({
                        id: "manual",
                        value: !isManualShareOfBalance
                          ? previousShareOfBalanceValue
                          : parsedValue,
                      });
                    }}
                    isAutosize
                    autoFocus={isManualShareOfBalance}
                  />
                  <span
                    className={classNames("shrink-0", {
                      "text-osmoverse-500": !isManualShareOfBalance,
                    })}
                  >
                    %
                  </span>
                </label>
              </li>
            </ul>

            <p className="subtitle2 rounded-xl border border-osmoverse-500 px-4 py-2 text-center text-osmoverse-300">
              {t(
                "oneClickTrading.settings.spendLimitScreen.shareOfBalanceDescription",
                {
                  shareOfBalance: formatShareOfBalance(shareOfBalance.value),
                }
              )}{" "}
              <SkeletonLoader
                className="inline"
                isLoaded={!isLoadingUserAssetsBreakdown}
              >
                <span>
                  ~
                  {userAssetsBreakdown?.aggregatedValue
                    .mul(
                      new Dec(
                        !shareOfBalance?.value ? 0 : shareOfBalance.value
                      ).quo(new Dec(100))
                    )
                    .toString() ??
                    new PricePretty(DEFAULT_VS_CURRENCY, 0).toString()}
                </span>
              </SkeletonLoader>
            </p>
          </Screen>
        </ScreenManager>

        <p className="text-center text-caption font-caption text-osmoverse-200">
          {t("oneClickTrading.settings.spendLimitScreen.fluctuationNotice")}
        </p>
      </div>
    </>
  );
};
