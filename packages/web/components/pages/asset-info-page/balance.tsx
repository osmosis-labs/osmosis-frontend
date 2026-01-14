import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { PrivateText } from "~/components/privacy";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { useFeatureFlags, useTranslation, useWindowSize } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { useStore } from "~/stores";
import { useUserSettingsStore } from "~/stores/user-settings-store";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export const AssetBalance = observer(({ className }: CustomClasses) => {
  const { chainStore, accountStore } = useStore();
  const bridgeAsset = useBridgeStore((state) => state.bridgeAsset);
  const { asset } = useAssetInfo();
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();
  const { isMobile } = useWindowSize();
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);

  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);

  const { data, isLoading } = api.edge.assets.getUserBridgeAsset.useQuery(
    {
      findMinDenomOrSymbol: asset.coinDenom,
      userOsmoAddress: account?.address,
    },
    { enabled: Boolean(account?.address) }
  );

  if (!account?.isWalletConnected) {
    return null;
  }

  // Factory tokens are native Osmosis assets (alloyed, liquid staking, etc.)
  const isFactoryToken = asset.coinMinimalDenom?.startsWith("factory/");

  // A stranded token has counterparty info but no transfer methods (defunct chain)
  // Exclude factory tokens which are intentionally native to Osmosis
  const isStrandedToken =
    data?.transferMethods.length === 0 &&
    Boolean(data?.counterparty?.length) &&
    !isFactoryToken;

  const transferEnabled = featureFlags.newDepositWithdrawFlow
    ? !isStrandedToken // new flow supports native assets, disable only stranded tokens
    : Boolean(data?.transferMethods.length); // old flow requires transfer methods

  const ConditionalTooltip = ({
    children,
    showTooltip,
    content,
  }: PropsWithChildren<{ showTooltip: boolean; content: string }>) =>
    showTooltip ? (
      <Tooltip content={content} className="h-full w-full">
        {children as ReactElement}
      </Tooltip>
    ) : (
      <>{children}</>
    );

  return (
    <section
      className={classNames(
        "rounded-3xl border border-osmoverse-700 p-6",
        className
      )}
    >
      <header className="mb-2">
        <h5 className="text-body2 font-body2 text-osmoverse-400">
          {t("tokenInfos.yourBalance")}
        </h5>
      </header>

      <SkeletonLoader isLoaded={!isLoading}>
        <p className="mb-2 text-h4 font-h4">
          <PrivateText
            text={
              data?.usdValue
                ? formatPretty(data.usdValue)
                : new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)).toString()
            }
          />
        </p>
      </SkeletonLoader>

      {!(hideBalances && !isMobile) && (
        <SkeletonLoader isLoaded={!isLoading}>
          <p className="mb-6 text-body1 font-body1 text-osmoverse-300">
            {data?.amount ? formatPretty(data.amount) : `0 ${asset.coinDenom}`}{" "}
            {t("tokenInfos.onOsmosis")}
          </p>
        </SkeletonLoader>
      )}

      {(transferEnabled || isStrandedToken) && (
        <div className="flex gap-3">
          <ConditionalTooltip
            showTooltip={isStrandedToken}
            content={t("assets.strandedTokenDepositDisabled")}
          >
            <Button
              size="lg-full"
              className="flex flex-1 items-center"
              onClick={() =>
                bridgeAsset({
                  anyDenom: asset.coinMinimalDenom,
                  direction: "deposit",
                })
              }
              disabled={!transferEnabled}
            >
              <Icon className="mr-2" id="deposit" height={16} width={16} />
              {t("assets.historyTable.colums.deposit")}
            </Button>
          </ConditionalTooltip>
          <ConditionalTooltip
            showTooltip={isStrandedToken}
            content={t("assets.strandedTokenWithdrawDisabled")}
          >
            <Button
              size="lg-full"
              className="flex flex-1 items-center"
              variant="secondary"
              onClick={() =>
                bridgeAsset({
                  anyDenom: asset.coinMinimalDenom,
                  direction: "withdraw",
                })
              }
              disabled={!transferEnabled || !data?.amount}
            >
              <Icon className="mr-2" id="withdraw" height={16} width={16} />
              {t("assets.historyTable.colums.withdraw")}
            </Button>
          </ConditionalTooltip>
        </div>
      )}
    </section>
  );
});
