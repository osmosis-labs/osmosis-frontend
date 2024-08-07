import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { TransferStatus } from "@osmosis-labs/bridge";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";

import { Spinner } from "../../loaders";
import { useRecentTransfers } from "../use-recent-transfers";
import { RecentTransferRow } from "./recent-activity-transaction";

export const RecentActivity: FunctionComponent = observer(() => {
  const { accountStore } = useStore();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const { t } = useTranslation();

  const recentTransfers = useRecentTransfers(account?.address);

  console.log("Recent Transfers: ", recentTransfers);

  return (
    <div className="flex w-full max-w-[320px] flex-col">
      <div className="flex cursor-pointer items-center justify-between py-3">
        <h6>{t("portfolio.recentActivity")}</h6>
        <LinkButton
          href="/transactions"
          className="text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="sm"
        />
      </div>
      <div className="flex w-full flex-col">
        {isWalletLoading ? (
          <Spinner />
        ) : recentTransfers?.length === 0 ? (
          <NoTransactionsSplash variant="transfers" />
        ) : (
          recentTransfers.map(({ txHash, status, amount, isWithdraw }) => {
            const getSimplifiedStatus = (status: TransferStatus) => {
              if (status === "success") return "success";
              if (["refunded", "connection-error", "failed"].includes(status))
                return "failed";
              return "pending";
            };

            const simplifiedStatus = getSimplifiedStatus(status);

            const coinAmount = amount.split(" ")[0];
            const coinDenom = amount.split(" ")[1];
            const asset = AssetLists.flatMap(({ assets }) => assets).find(
              ({ symbol }) => symbol === coinDenom
            );

            if (!asset) return null;

            const currency = makeMinimalAsset(asset);

            const pendingText = isWithdraw
              ? t("assets.historyTable.pendingWithdraw")
              : t("assets.historyTable.pendingDeposit");
            const successText = isWithdraw
              ? t("assets.historyTable.successWithdraw")
              : t("assets.historyTable.successDeposit");
            const failedText = isWithdraw
              ? t("assets.historyTable.failWithdraw")
              : t("assets.historyTable.failDeposit");

            return (
              <RecentTransferRow
                key={txHash}
                status={simplifiedStatus}
                effect={isWithdraw ? "withdraw" : "deposit"}
                title={{
                  pending: pendingText,
                  success: successText,
                  failed: failedText,
                }}
                transfer={{
                  direction: isWithdraw ? "withdraw" : "deposit",
                  amount: new CoinPretty(
                    currency,
                    new Dec(coinAmount).mul(
                      DecUtils.getTenExponentN(currency.coinDecimals)
                    ) // amount includes decimals
                  ),
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
});
