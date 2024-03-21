import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { TokenSelect } from "~/components/control";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { ModalBase, ModalBaseProps } from "~/modals";
import { ObservableAssets } from "~/stores/assets/assets-store";

/** MOBILE: Pre transfer to select whether to deposit/withdraw */
export const PreTransferModal: FunctionComponent<
  ModalBaseProps & {
    selectedToken: ObservableAssets["unverifiedIbcBalances"][number];
    tokens: CoinPretty[];
    externalDepositUrl?: string;
    externalWithdrawUrl?: string;
    onSelectToken: (coinDenom: string) => void;
    onWithdraw: () => void;
    onDeposit: () => void;
  }
> = observer((props) => {
  const {
    selectedToken,
    tokens,
    externalDepositUrl,
    externalWithdrawUrl,
    onSelectToken,
    onWithdraw,
    onDeposit,
  } = props;
  const { t } = useTranslation();
  const tokenValue = useCoinFiatValue(selectedToken.balance);
  const isEthAsset = selectedToken.originBridgeInfo?.bridge === "axelar";
  return (
    <ModalBase
      {...props}
      title={
        <TokenSelect
          selectedTokenDenom={selectedToken.balance.denom}
          tokens={tokens}
          onSelect={(coinDenom) => onSelectToken(coinDenom)}
          sortByBalances
        />
      }
    >
      <div className="flex flex-col gap-7 pt-5">
        <div className="items-left flex flex-col gap-2 px-5">
          <span className="caption text-osmoverse-400">
            {t("assets.table.preTransfer.currentBal")}
          </span>
          <h6>{selectedToken.balance.trim(true).toString()}</h6>
          {tokenValue && (
            <span className="subtitle2 text-osmoverse-400">
              {tokenValue?.toString()}
            </span>
          )}
        </div>
        <div className="flex place-content-between gap-3 py-2">
          {Boolean(externalWithdrawUrl) ? (
            <Button className="flex w-full gap-2" variant="outline" asChild>
              <a href={externalDepositUrl} rel="noreferrer" target="_blank">
                {t("assets.table.preTransfer.withdraw")}
                <Image
                  alt="external transfer link"
                  src="/icons/external-link-white.svg"
                  height={12}
                  width={12}
                />
              </a>
            </Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={onWithdraw}>
              {t("assets.table.preTransfer.withdraw")}
            </Button>
          )}
          {Boolean(externalDepositUrl) && (
            <Button className="flex w-full gap-2" asChild>
              <a
                href={externalDepositUrl}
                rel="noreferrer"
                target="_blank"
                className="w-full"
              >
                <span>{t("assets.table.preTransfer.deposit")}</span>
                <Image
                  alt="external transfer link"
                  src="/icons/external-link-white.svg"
                  height={12}
                  width={12}
                />
              </a>
            </Button>
          )}
          {!isEthAsset && !externalDepositUrl && (
            <Button className="w-full" onClick={onDeposit}>
              {t("assets.table.preTransfer.deposit")}
            </Button>
          )}
        </div>
      </div>
    </ModalBase>
  );
});
