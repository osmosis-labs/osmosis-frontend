import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import LinkButton from "~/components/buttons/link-button";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useNavBar } from "~/hooks";
import { theme } from "~/tailwind.config";

type Status = "Pending" | "Success" | "Failure";

import { Dialog, Transition } from "@headlessui/react";
// import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

export function SlideOver({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-gray-500 fixed inset-0 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 top-[72px] flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-osmoverse-900 shadow-xl">
                    <SlideOverContent onRequestClose={() => setOpen(false)} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

interface TransactionRowProps {
  status: Status;
  setOpen: (open: boolean) => void;
  open: boolean;
}

const TransactionRow = ({ status, setOpen, open }: TransactionRowProps) => {
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
        alt="OSMO"
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

const TransactionContent = ({
  setOpen,
  open,
}: {
  setOpen: (open: boolean) => void;
  open: boolean;
}) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3">Transactions</h1>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            Explorer &#x2197;
          </Button>
          <Button variant="secondary" size="md">
            Tax Reports &#x2197;
          </Button>
        </div>
      </div>

      {/* TODO - parse by date, into groups */}

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Pending</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Pending" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Earlier Today</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">Yesterday</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">March 11</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Success" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">February 8</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />
      <TransactionRow status="Failure" setOpen={setOpen} open={open} />

      <div className="flex flex-col gap-4 px-4 pt-8 pb-3">
        <div className="text-osmoverse-300">December 29, 2023</div>
        <hr className="text-osmoverse-700" />
      </div>
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
      <TransactionRow status="Success" setOpen={setOpen} open={open} />
    </div>
  );
};

const SlideOverContent = ({
  onRequestClose,
}: {
  onRequestClose: () => void;
}) => {
  return (
    <div className="w-container flex h-full flex-col border-l-[1px] border-osmoverse-700 bg-osmoverse-900">
      <div className="py-4 pl-4">
        <IconButton
          aria-label="Close"
          mode="unstyled"
          size="unstyled"
          className="w-fit cursor-pointer py-0 text-osmoverse-400 hover:text-white-full"
          icon={<Icon id="close" width={32} height={32} />}
          onClick={onRequestClose}
        />
      </div>
      <div className="flex flex-col px-4">
        <div className="flex flex-col items-center gap-4 pt-2 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
            <Icon id="swap" width={24} height={24} aria-label="swap icon" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-h5">Swapped</div>
            <div className="text-body1 text-osmoverse-300">
              March 14, 2024, 13:01
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
          <div className="flex justify-between p-2">
            <div className="flex gap-4">
              <Image
                alt="OSMO"
                src="/tokens/generated/osmo.svg"
                height={32}
                width={32}
              />
              <div className="flex flex-col">
                <div className="text-subtitle1">Sold</div>
                <div className="text-body1 text-osmoverse-300">OSMO</div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="text-subtitle1">$100.00</div>
              <div className="text-body1 text-osmoverse-300">10</div>
            </div>
          </div>
          <div className="flex h-10 w-12 items-center justify-center p-2">
            <Image
              alt="down"
              src="/icons/arrow-right.svg"
              width={24}
              height={24}
              className="rotate-90 text-osmoverse-600"
            />
          </div>
          <div className="flex justify-between p-2">
            <div className="flex gap-4">
              <Image
                alt="USDC"
                src="/tokens/generated/usdc.svg"
                height={32}
                width={32}
              />
              <div className="flex flex-col">
                <div className="text-subtitle1">Sold</div>
                <div className="text-body1 text-osmoverse-300">OSMO</div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="text-subtitle1">$100.00</div>
              <div className="text-body1 text-osmoverse-300">10</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col py-3">
          <div className="flex justify-between py-3">
            <div>Execution Price</div>
            <div className="text-body1 text-wosmongton-300">
              1 OSMO = 97.80 USDC
            </div>
          </div>
          <div className="flex justify-between py-3">
            <div>Total Fees</div>
            <div className="text-body1 text-wosmongton-300">0.001 OSMO</div>
          </div>
          <div className="flex justify-between py-3">
            <div>Transaction Fees</div>
            <div className="text-body1 text-wosmongton-300">
              F7AC9A...F58F87
            </div>
          </div>
        </div>
        <Button size="default" variant="secondary" asChild>
          <a
            rel="noreferrer"
            target="_blank"
            href={`https://www.mintscan.io/cosmos/txs/${
              "" // TDODO link this - txHash
            }`}
          >
            <span>View on Explorer &#x2197;</span>
          </a>
        </Button>
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

  const [open, setOpen] = useState(true);

  return (
    <main className="flex gap-8 px-8">
      <SlideOver open={open} setOpen={setOpen} />
      <TransactionContent open={open} setOpen={setOpen} />
    </main>
  );
};

export default Transactions;
