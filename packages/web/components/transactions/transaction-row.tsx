import {
  MappedTransaction,
  MappedTransactionMetadata,
} from "@osmosis-labs/server";
import classNames from "classnames";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

type Status = "Pending" | "Success" | "Failure";

interface TransactionDetailsProps {
  status: Status;
  // TODO - update metadata type
  metadata: MappedTransactionMetadata[];
}

const TransactionDetails = ({ status, metadata }: TransactionDetailsProps) => {
  // TODO - update this to filter by metadata type
  const { tokenIn, tokenOut } = metadata[0].value[0].txInfo;

  // console.log("metadata: ", metadata[0]);
  // console.log("tokenIn: ", tokenIn);
  // console.log("tokenOut: ", tokenOut);

  return (
    <div className="flex gap-4">
      <Image
        alt={tokenIn.token.denom}
        src={tokenIn.token.currency.coinImageUrl}
        height={32}
        width={32}
      />
      <div className="flex flex-col text-right ">
        <div
          className={classNames("text-subtitle1", {
            "text-osmoverse-400": status === "Pending",
            "text-osmoverse-100": status === "Success",
            "text-rust-400": status === "Failure",
          })}
        >
          - ${Number(tokenIn.usd.toDec().toString()).toFixed(2)}
        </div>
        <div className="text-body2 text-osmoverse-400">
          {formatPretty(tokenIn.token, { maxDecimals: 2 })?.toString()}
        </div>
      </div>
      <Image
        alt="right"
        src="/icons/arrow-right.svg"
        width={24}
        height={24}
        className="text-osmoverse-600"
      />
      <Image
        alt={tokenOut.token.denom}
        src={tokenOut.token.currency.coinImageUrl}
        height={32}
        width={32}
      />
      <div className="flex flex-col text-right text-osmoverse-400">
        <div
          className={classNames("text-subtitle1", {
            "text-osmoverse-400": status === "Pending",
            "text-bullish-400": status === "Success",
            "text-rust-400": status === "Failure",
          })}
        >
          + ${Number(tokenOut.usd.toDec().toString()).toFixed(2)}
        </div>
        <div className="text-body2">
          {formatPretty(tokenOut.token, { maxDecimals: 2 })?.toString()}
        </div>
      </div>
    </div>
  );
};

interface TransactionStatusProps {
  status: Status;
}

const TransactionStatus = ({ status }: TransactionStatusProps) => {
  return (
    <div className="flex items-center gap-4">
      {status === "Pending" && (
        <Spinner className="h-8 w-8 pb-4 text-wosmongton-500" />
      )}
      {status === "Success" && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
          <Icon id="swap" width={24} height={24} aria-label="swap icon" />
        </div>
      )}
      {status === "Failure" && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
          <Icon
            width={24}
            height={24}
            id="alert-circle"
            color={theme.colors.rust[400]}
          />
        </div>
      )}

      <p className="text-osmoverse-100">
        {status === "Pending" && "Swapping"}
        {status === "Success" && "Swapped"}
        {status === "Failure" && "Swap failed"}
      </p>
    </div>
  );
};

interface TransactionRowProps {
  status: Status;
  setOpen: () => void;
  transaction: MappedTransaction;
}

export const TransactionRow = ({
  status,
  setOpen,
  transaction,
}: TransactionRowProps) => {
  return (
    // h-20 = h-12 (via designs) + pt-4 + pb-4
    <div
      className="w-container flex h-20 cursor-pointer justify-between rounded-2xl p-4 hover:bg-osmoverse-825"
      onClick={() => setOpen()}
    >
      <TransactionStatus status={status} />
      <TransactionDetails status={status} metadata={transaction.metadata} />
    </div>
  );
};
