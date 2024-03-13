import { Dec } from "@keplr-wallet/unit";
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

export const RemoveLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onRemoveLiquidity?: (result: Promise<void>) => void;
  } & ModalBaseProps &
    RemovableShareLiquidity
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore } = useStore();
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const [percentage, setPercentage] = useState("50");

  const removeLiquidity = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        if (!account) return reject("No account");
        account.osmosis
          .sendExitPoolMsg(
            poolId,
            props.shares
              .mul(new Dec(percentage).quo(new Dec(100)))
              .toDec()
              .toString(),
            undefined,
            undefined,
            (tx) => {
              if (Boolean(tx.code)) reject();
              else resolve();
            }
          )
          .catch(reject);
      }),
    [account, poolId, percentage, props.shares]
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: props.shares.toDec().isZero() || isSendingMsg,
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
