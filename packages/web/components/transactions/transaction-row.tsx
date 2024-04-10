import classNames from "classnames";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { theme } from "~/tailwind.config";

type Status = "Pending" | "Success" | "Failure";

interface TransactionDetailsProps {
  status: Status;
}

const TransactionDetails = ({ status }: TransactionDetailsProps) => {
  return (
    <div className="flex gap-4">
      <Image
        alt="OSMO"
        src="/tokens/generated/osmo.svg"
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
          - $100.00
        </div>
        <div className="text-body2 text-osmoverse-400">10 OSMO</div>
      </div>
      <Image
        alt="right"
        src="/icons/arrow-right.svg"
        width={24}
        height={24}
        className="text-osmoverse-600"
      />
      <Image
        alt="USDC"
        src="/tokens/generated/usdc.svg"
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
          + $100.00
        </div>
        <div className="text-body2">100 USDC</div>
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
  setOpen: (open: boolean) => void;
  open: boolean;
}

export const TransactionRow = ({
  status,
  setOpen,
  open,
}: TransactionRowProps) => {
  return (
    // h-20 = h-12 (via designs) + pt-4 + pb-4
    <div
      className="w-container flex h-20 cursor-pointer justify-between rounded-2xl p-4 hover:bg-osmoverse-825"
      onClick={() => setOpen(!open)}
    >
      <TransactionStatus status={status} />
      <TransactionDetails status={status} />
    </div>
  );
};
