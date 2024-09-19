import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { TransactionRow } from "~/components/transactions/transaction-row";
import { formatFiatPrice } from "~/utils/formatter";
export type TransactionStatus = "pending" | "success" | "failed";

export const RecentActivityRow: FunctionComponent<{
  status: TransactionStatus;
  title: { [key in TransactionStatus]: string };
  leftComponent: JSX.Element | null;
  rightComponent: JSX.Element | null;
}> = ({ leftComponent, rightComponent }) => {
  return (
    <div className="-mx-2 flex justify-between gap-4 p-2">
      {leftComponent}
      {rightComponent}
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
      <p className="body2 text-white-full">{title[status]}</p>
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
