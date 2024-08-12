import { sleep } from "@axelar-network/axelarjs-sdk";
import type { EncodeObject } from "@cosmjs/proto-signing";
import { PricePretty } from "@keplr-wallet/unit";
import { EarnStrategy } from "@osmosis-labs/server";
import {
  makeExecuteCosmwasmContractMsg,
  makeWithdrawDelegationRewardsMsg,
} from "@osmosis-labs/tx";
import { useCallback } from "react";

import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export const EarnRewards = ({
  totalUnclaimedRewards,
  unclaimedRewards,
  areBalancesLoading,
}: {
  totalUnclaimedRewards: PricePretty;
  unclaimedRewards: { id: string; platform: EarnStrategy["platform"] }[];
  areBalancesLoading: boolean;
}) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const apiUtils = api.useUtils();

  const filteredUnclaimedRewards = unclaimedRewards.filter(
    (unclaimedReward) =>
      /**
       * Currently, claiming rewards is unsupported for stride
       */
      unclaimedReward.platform !== "stride"
  );

  const { logEvent } = useAmplitudeAnalytics();

  const claimAllRewards = useCallback(async () => {
    logEvent([EventName.EarnPage.rewardsClaimStarted]);
    const messages: EncodeObject[] = [];

    if (!account) return;

    for (const { id, platform } of filteredUnclaimedRewards) {
      switch (platform) {
        case "Osmosis":
          messages.push(
            await makeWithdrawDelegationRewardsMsg({
              delegator: account.address ?? "",
            })
          );
          break;
        case "Quasar":
          messages.push(
            await makeExecuteCosmwasmContractMsg({
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
          break;
        case "Levana":
          messages.push(
            await makeExecuteCosmwasmContractMsg({
              contract: id.split("-")[0], // this strips the -x|lp part of the contract id
              msg: Buffer.from(
                JSON.stringify({
                  claim_yield: {},
                })
              ),
              sender: account.address ?? "",
              funds: [],
            })
          );
          break;
      }
    }

    try {
      await accountStore.signAndBroadcast(
        accountStore.osmosisChainId,
        "unknown",
        messages,
        undefined,
        undefined,
        undefined
      );
    } finally {
      /**
       * The sleep is needed in order to match the refetch time
       * of the backend service (getStrategyBalance) that is going to be re-called
       * after the TX.
       */
      await sleep(1);
      unclaimedRewards.forEach(({ id }) => {
        apiUtils.edge.earn.getStrategyBalance.invalidate({
          strategyId: id,
          userOsmoAddress: account.address ?? "",
        });
      });
    }
  }, [
    account,
    accountStore,
    apiUtils.edge.earn.getStrategyBalance,
    filteredUnclaimedRewards,
    logEvent,
    unclaimedRewards,
  ]);

  return (
    <div className="flex flex-col justify-between rounded-3x4pxlinset bg-osmoverse-850 px-6 pb-6 pt-7">
      <h5 className="text-lg font-semibold text-osmoverse-100">
        {t("earnPage.rewards")}
      </h5>
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
            areBalancesLoading ||
            account?.txTypeInProgress !== "" ||
            filteredUnclaimedRewards.length === 0
          }
          className="max-h-11"
          onClick={claimAllRewards}
        >
          {t("earnPage.claimAllRewards")}
        </Button>
      </div>
    </div>
  );
};
