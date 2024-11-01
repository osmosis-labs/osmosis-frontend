import { TxSnapshot } from "@osmosis-labs/bridge";
import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { TransactionRow } from "~/components/transactions/transaction-row";
import { useTranslation } from "~/hooks/language/context";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";
type TransactionStatus = "pending" | "success" | "failed";

export const RecentActivityRow: FunctionComponent<{
  status: TransactionStatus;
  title: { [key in TransactionStatus]: string };
  leftComponent: JSX.Element | null;
  rightComponent: JSX.Element | null;
}> = ({ status, title, leftComponent, rightComponent }) => {
  return (
    <div className="-mx-2 flex justify-between gap-4 rounded-2xl p-2">
      <div className="flex flex-col">
        <p className="body2 text-white-full">{title[status]}</p>
        {leftComponent}
      </div>
      <div className="flex items-center justify-end">{rightComponent}</div>
    </div>
  );
};

export const SwapRow: FunctionComponent<TransactionRow> = ({
  status,
  title,
  tokenConversion,
}) => {
  const leftComponent = tokenConversion ? (
    <div className="flex flex-col gap-0.5">
      <div className="caption flex items-center gap-1 text-osmoverse-300">
        {tokenConversion.tokenIn?.value &&
          formatFiatPrice(tokenConversion.tokenIn?.value)}{" "}
        {tokenConversion.tokenIn.amount.denom}{" "}
        <Icon id="arrow-right" width={14} height={14} />{" "}
        {tokenConversion.tokenOut.amount.denom}
      </div>
    </div>
  ) : null;

  const rightComponent = tokenConversion ? (
    <div className="flex items-center justify-end">
      <FallbackImg
        alt={tokenConversion.tokenIn.amount.denom}
        src={tokenConversion.tokenIn.amount.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={32}
        width={32}
      />
      <Icon
        id="arrows-swap"
        width={16}
        height={16}
        className="my-[8px] mx-[4px] text-osmoverse-500"
      />
      <FallbackImg
        alt={tokenConversion.tokenOut.amount.denom}
        src={tokenConversion.tokenOut.amount.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={32}
        width={32}
      />
    </div>
  ) : null;

  return (
    <RecentActivityRow
      status={status}
      title={title}
      leftComponent={leftComponent}
      rightComponent={rightComponent}
    />
  );
};

export const RecentTransferRow: FunctionComponent<
  TransactionRow & {
    toChain: TxSnapshot["toChain"];
    fromChain: TxSnapshot["fromChain"];
  }
> = ({ status, title, transfer, toChain, fromChain }) => {
  const { t } = useTranslation();

  const chain = transfer?.direction === "withdraw" ? toChain : fromChain;

  const { data: cosmosChain } = api.edge.chains.getCosmosChain.useQuery(
    {
      findChainNameOrId: chain!.chainId.toString(),
    },
    {
      enabled: chain?.chainType === "cosmos",
      useErrorBoundary: false,
    }
  );
  const { data: evmChain } = api.edge.chains.getEvmChain.useQuery(
    {
      chainId: Number(chain!.chainId),
    },
    {
      enabled: chain?.chainType === "evm",
      useErrorBoundary: false,
    }
  );

  const chainPrettyName =
    chain?.chainType === "cosmos" ? cosmosChain?.pretty_name : evmChain?.name;
  const chainLogoUri =
    chain?.chainType === "cosmos"
      ? cosmosChain?.logoURIs?.png ?? cosmosChain?.logoURIs?.svg
      : evmChain?.relativeLogoUrl;
  const chainColor =
    chain?.chainType === "cosmos"
      ? cosmosChain?.logoURIs?.theme?.background_color_hex
      : evmChain?.color;

  const text =
    transfer?.direction === "withdraw"
      ? t("transfer.to").toLowerCase()
      : t("transfer.from").toLowerCase();

  const leftComponent = transfer ? (
    <div className="caption flex gap-1 text-osmoverse-300">
      {formatPretty(transfer.amount, { maxDecimals: 6 })} {text}{" "}
      {chainPrettyName}
    </div>
  ) : null;

  const rightComponentList = [
    <FallbackImg
      key="fallback-img"
      alt={transfer?.amount.denom}
      src={transfer?.amount.currency.coinImageUrl}
      fallbacksrc="/icons/question-mark.svg"
      height={32}
      width={32}
    />,
    <Icon
      key="icon-arrow-right"
      id="arrow-right"
      width={16}
      height={16}
      className="my-[8px] mx-[4px] text-osmoverse-500"
    />,
    <ChainLogo
      key="chain-logo"
      prettyName={chainPrettyName}
      color={chainColor}
      logoUri={chainLogoUri}
      size="md"
    />,
  ];

  const rightComponent = (
    <>
      {transfer?.direction === "withdraw"
        ? rightComponentList
        : rightComponentList.reverse()}
    </>
  );

  return (
    <RecentActivityRow
      status={status}
      title={title}
      leftComponent={leftComponent}
      rightComponent={rightComponent}
    />
  );
};
