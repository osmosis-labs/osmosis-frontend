import type { EncodeObject } from "@cosmjs/proto-signing";
import { PricePretty } from "@keplr-wallet/unit";
import { useCallback } from "react";

import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import type { EarnStrategy } from "~/server/queries/numia/earn";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export const EarnRewards = ({
  totalUnclaimedRewards,
  unclaimedRewards,
  areQueriesLoading,
}: {
  totalUnclaimedRewards: PricePretty;
  unclaimedRewards: { id: string; provider: EarnStrategy["provider"] }[];
  areQueriesLoading: boolean;
}) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const apiUtils = api.useUtils();

  const claimAllRewards = useCallback(async () => {
    const messages: EncodeObject[] = [];

    if (!account) return;

    unclaimedRewards.forEach(({ id, provider }) => {
      switch (provider) {
        case "osmosis":
          messages.push(
            account?.osmosis.msgOpts.withdrawDelegationRewards.messageComposer({
              delegator: account.address ?? "",
            })
          );
          break;
        case "quasar":
          messages.push(
            account.cosmwasm.msgOpts.executeWasm.messageComposer({
              contract: id,
              msg: Buffer.from(
                JSON.stringify({
                  vault_extension: {
                    claim_rewards: {},
                  },
                })
              ),
              sender: account.address ?? "",
              funds: [],
            })
          );
      }
    });

    try {
      await accountStore.signAndBroadcast(
        accountStore.osmosisChainId,
        "unknown",
        messages,
        undefined,
        undefined,
        undefined,
        (tx) => {
          if (tx.code === 0) {
            unclaimedRewards.forEach(({ id }) => {
              apiUtils.edge.earn.getStrategyBalance.invalidate({
                strategyId: id,
                userOsmoAddress: account.address ?? "",
              });
            });
          }
        }
      );
    } catch (error) {}
  }, [
    account,
    accountStore,
    apiUtils.edge.earn.getStrategyBalance,
    unclaimedRewards,
  ]);

  return (
    <div className="flex flex-col justify-between rounded-3x4pxlinset bg-osmoverse-850 px-6 pt-7 pb-6">
      <h5 className="text-lg font-semibold text-osmoverse-100">
        {t("earnPage.rewards")}
      </h5>
      {/* <div className="mt-5 flex flex-col gap-1">
        <h5 className="text-xl font-semibold text-bullish-400">$221.64</h5>
        <div className="flex items-center gap-1">
          <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
            {t("earnPage.estimatedInYearlyRewards")}
          </small>
          <Tooltip
            content={"Lorem ipsum dolor sit amet, consecteur adisciping elit."}
          >
            <Icon id="info" className="h-4 w-4" />
          </Tooltip>
        </div>
      </div> */}
      <div className="mt-3.5 flex justify-between">
        <h4 className="text-osmoverse-200">
          {formatPretty(totalUnclaimedRewards)}
        </h4>
        <small className="max-w-[54px] text-right text-xs font-subtitle2 font-medium text-osmoverse-300">
          {t("earnPage.availableToClaim")}
        </small>
      </div>
      <div className="mt-4.5 flex flex-col gap-3">
        <Button
          disabled={
            totalUnclaimedRewards.toDec().isZero() ||
            areQueriesLoading ||
            account?.txTypeInProgress !== ""
          }
          mode={"primary"}
          className="max-h-11"
          onClick={claimAllRewards}
        >
          {t("earnPage.claimAllRewards")}
        </Button>
      </div>
    </div>
  );
};
