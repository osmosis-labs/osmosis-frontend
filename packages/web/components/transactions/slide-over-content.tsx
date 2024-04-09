import { Transition } from "@headlessui/react";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { CopyIconButton } from "~/components/buttons/copy-icon-button";
import IconButton from "~/components/buttons/icon-button";
import { Button } from "~/components/ui/button";

export const SlideOverContent = ({
  onRequestClose,
  open,
}: {
  onRequestClose: () => void;
  open: boolean;
}) => {
  return (
    <Transition
      show={open}
      enter="transition-width ease-out duration-300"
      enterFrom="w-0"
      enterTo="w-[452px]"
      leave="transition-width ease-out duration-300"
      leaveFrom="w-[452px]"
      leaveTo="w-0"
    >
      <div className="flex min-h-full flex-col border-l-[1px] border-osmoverse-700 bg-osmoverse-900">
        <div className="fixed mx-4 flex flex-col">
          <div className="py-4">
            <IconButton
              aria-label="Close"
              mode="unstyled"
              size="unstyled"
              className="w-fit cursor-pointer py-0 text-osmoverse-400 hover:text-white-full"
              icon={<Icon id="close" width={48} height={48} />}
              onClick={onRequestClose}
            />
          </div>
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
            <div className="flex justify-between gap-3 py-3">
              <div>Execution Price</div>
              <div className="flex gap-3">
                <div className="text-body1 text-wosmongton-300">
                  1 OSMO = 97.80 USDC
                </div>
                <CopyIconButton valueToCopy="97.80 USDC" />
              </div>
            </div>
            <div className="flex justify-between gap-3 py-3">
              <div>Total Fees</div>
              <div className="text-body1 text-wosmongton-300">0.001 OSMO</div>
            </div>
            <div className="flex justify-between py-3">
              <div>Transaction Fees</div>
              <div className="flex gap-3">
                <div className="text-body1 text-wosmongton-300">
                  F7AC9A...F58F87
                </div>
                <CopyIconButton valueToCopy="F7AC9A...F58F87" />
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
    </Transition>
  );
};
