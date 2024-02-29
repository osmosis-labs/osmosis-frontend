import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Info } from "~/components/alert";
import { Icon } from "~/components/assets";
import { buttonCVA } from "~/components/buttons";
import { TokenSelect } from "~/components/control";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { ModalBase, ModalBaseProps } from "~/modals";
import { ObservableAssets } from "~/stores/assets/assets-store";
import { theme } from "~/tailwind.config";

/** MOBILE: Pre transfer to select whether to deposit/withdraw */
export const PreTransferModal: FunctionComponent<
  ModalBaseProps & {
    selectedToken: ObservableAssets["unverifiedIbcBalances"][number];
    tokens: CoinPretty[];
    externalDepositUrl?: string;
    externalWithdrawUrl?: string;
    isUnstable?: boolean;
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
    isUnstable,
    onSelectToken,
    onWithdraw,
    onDeposit,
  } = props;
  const { isMobile } = useWindowSize();
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

        {isUnstable && (
          <div className="flex flex-col gap-2">
            <Icon
              id="alert-triangle"
              color={theme.colors.rust[500]}
              className="w-8"
            />
            <Info
              caption={t("unstableAssetsWarning.title")}
              size="subtle"
              message={t("unstableAssetsWarning.description")}
              isMobile={isMobile}
            />
          </div>
        )}
        <div className="flex place-content-between gap-3 py-2">
          {externalWithdrawUrl ? (
            <a
              className={classNames(
                buttonCVA({
                  className:
                    "h-10 w-full gap-2 border-wosmongton-200/30 bg-wosmongton-200/30 hover:border-wosmongton-200/40 hover:bg-wosmongton-200/40",
                  mode: "primary",
                }),
                { "opacity-30": isUnstable }
              )}
              href={externalWithdrawUrl}
              rel="noreferrer"
              target="_blank"
              style={{ pointerEvents: "none", cursor: "default" }}
            >
              {t("assets.table.preTransfer.withdraw")}
              <Image
                alt="external transfer link"
                src="/icons/external-link-white.svg"
                height={12}
                width={12}
              />
            </a>
          ) : (
            <Button className="w-full" variant="outline" onClick={onWithdraw}>
              {t("assets.table.preTransfer.withdraw")}
            </Button>
          )}
          {Boolean(externalDepositUrl) && (
            <a
              href={externalDepositUrl}
              rel="noreferrer"
              target="_blank"
              style={{ pointerEvents: "none", cursor: "default" }}
              className="w-full"
            >
              <Button className="flex w-full gap-2">
                <span>{t("assets.table.preTransfer.deposit")}</span>
                <Image
                  alt="external transfer link"
                  src="/icons/external-link-white.svg"
                  height={12}
                  width={12}
                />
              </Button>
            </a>
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
