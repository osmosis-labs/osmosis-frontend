import { Dec, Int } from "@keplr-wallet/unit";
import { WeightedPoolRawResponse } from "@osmosis-labs/server";
import { NoAvailableSharesError } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useState } from "react";

import {
  RemovableShareLiquidity,
  RemoveLiquidity,
} from "~/components/complex/remove-liquidity";
import { tError } from "~/components/localization";
import { useTranslation } from "~/hooks";
import { useConnectWalletModalRedirect } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const RemoveLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onRemoveLiquidity?: (result: Promise<void>) => void;
  } & ModalBaseProps &
    RemovableShareLiquidity
> = observer((props) => {
  const { poolId } = props;
  const { accountStore } = useStore();
  const { t } = useTranslation();

  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const [percentage, setPercentage] = useState("50");

  const { data: pool, isLoading: isLoadingPool } =
    api.edge.pools.getSharePool.useQuery({
      poolId,
    });

  const removeLiquidity = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        if (!account) return reject("No account");
        if (!pool) return reject("Pool pool found. ID: " + poolId);

        const exitFee =
          pool.type === "weighted"
            ? (pool.raw as WeightedPoolRawResponse).pool_params.exit_fee
            : "0";

        account.osmosis
          .sendExitPoolMsg(
            poolId,
            props.shares
              .mul(new Dec(percentage).quo(new Dec(100)))
              .toDec()
              .toString(),
            new Int(pool.raw.total_shares.amount),
            pool.reserveCoins.map((coin) => coin.toCoin()),
            new Dec(exitFee),
            undefined,
            undefined,
            (tx) => {
              if (Boolean(tx.code)) reject();
              else resolve();
            }
          )
          .catch(reject);
      }),
    [account, pool, poolId, percentage, props.shares]
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: props.shares.toDec().isZero() || isSendingMsg || isLoadingPool,
      onClick: () => {
        const removeLiquidityResult = removeLiquidity().finally(() =>
          props.onRequestClose()
        );
        props.onRemoveLiquidity?.(removeLiquidityResult);
      },
      children: props.shares.toDec().isZero()
        ? t(...tError(new NoAvailableSharesError("No available shares")))
        : t("removeLiquidity.title"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={t("removeLiquidity.title")}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <RemoveLiquidity
        className="pt-4"
        percentage={percentage}
        setPercentage={setPercentage}
        actionButton={accountActionButton}
        {...props}
      />
    </ModalBase>
  );
});
