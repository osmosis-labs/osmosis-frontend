import classNames from "classnames";
import Image from "next/image";

import { Icon } from "~/components/assets";
import LinkButton from "~/components/buttons/link-button";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useNavBar } from "~/hooks";
import { theme } from "~/tailwind.config";

type Status = "Pending" | "Success" | "Failure";
interface TransactionRowProps {
  status: Status;
}

const TransactionRow = ({ status }: TransactionRowProps) => {
  return (
    <div className="w-container m-4 flex h-12 justify-between">
      <TransactionStatus status={status} />
      <TransactionDetails status={status} />
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

interface TransactionDetailsProps {
  status: Status;
}

const TransactionDetails = ({ status }: TransactionDetailsProps) => {
  const getFromTextStyle = () => {
    if (status === "Pending") return "text-osmoverse-400";
    if (status === "Success") return "text-osmoverse-100";
    if (status === "Failure") return "text-rust-400";
  };

  const getToTextStyle = () => {
    if (status === "Pending") return "text-osmoverse-400";
    if (status === "Success") return "text-bullish-400";
    if (status === "Failure") return "text-rust-400";
  };

  return (
    <div className="flex gap-4">
      <Image
        alt="USDC"
        src="/tokens/generated/osmo.svg"
        height={32}
        width={32}
      />
      <div className="flex flex-col text-right ">
        <div className={classNames("text-subtitle1", getFromTextStyle())}>
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
        <div className={classNames("text-subtitle1", getToTextStyle())}>
          + $100.00
        </div>
        <div className="text-body2">100 USDC</div>
      </div>
    </div>
  );
};

export const Transactions: React.FC = () => {
  useNavBar({
    title: (
      <LinkButton
        className="mr-auto md:invisible"
        icon={
          <Image
            alt="left"
            src="/icons/arrow-left.svg"
            width={24}
            height={24}
            className="text-osmoverse-200"
          />
        }
        // TODO add translations
        label="Portfolio"
        ariaLabel="Portfolio"
        href="/portfolio"
      />
    ),
    ctas: [],
  });

  return (
    <main className="flex flex-col px-8">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3">Transactions</h1>
        <div className="flex gap-3">
          <Button
            // TODO update with new variant
            size="md"
          >
            Explorer &#x2197;
          </Button>
          <Button
            // TODO update with new variant
            size="md"
          >
            Tax Reports &#x2197;
          </Button>
        </div>
      </div>

      {/* TODO - parse by date, into groups */}

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Pending</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Pending" />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Earlier Today</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" />
      <TransactionRow status="Failure" />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Yesterday</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">March 11</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" />
      <TransactionRow status="Success" />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">February 8</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Failure" />
      <TransactionRow status="Failure" />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">December 29, 2023</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" />
      <TransactionRow status="Success" />
    </main>
  );
};

export default Transactions;
