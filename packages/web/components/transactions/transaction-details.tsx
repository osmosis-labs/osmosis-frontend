import { Transition } from "@headlessui/react";
import { FormattedTransaction } from "@osmosis-labs/server";
import { getShortAddress } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { CopyIconButton } from "~/components/buttons/copy-icon-button";
import IconButton from "~/components/buttons/icon-button";
import { Button } from "~/components/ui/button";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { formatPretty } from "~/utils/formatter";

export const TransactionDetailsContent = ({
  onRequestClose,
  isModal,
  transaction,
}: {
  onRequestClose: () => void;
  isModal: boolean;
  transaction: FormattedTransaction;
}) => {
  const { tokenIn, tokenOut } = transaction.metadata[0].value[0].txInfo;

  const txFee = transaction.metadata[0].value[0].txFee[0];

  const formattedDate = dayjs(transaction.blockTimestamp).format(
    "MMM DD, YYYY, HH:mm"
  );

  const conversionRate = formatPretty(
    tokenIn.token.toDec().quo(tokenOut.token.toDec()),
    { maxDecimals: 2 }
  );

  return (
    <div
      className={classNames(
        "flex min-h-full flex-col",
        !isModal && "border-l-[1px] border-osmoverse-700 bg-osmoverse-900"
      )}
    >
      <div className={classNames("mx-4 flex flex-col", !isModal && "fixed")}>
        {!isModal && (
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
        )}
        <div className="flex flex-col items-center gap-4 pt-2 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
            <Icon id="swap" width={24} height={24} aria-label="swap icon" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-h5">Swapped</div>
            <div className="body1 text-osmoverse-300">{formattedDate}</div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
          <div className="flex justify-between p-2">
            <div className="flex gap-4">
              <FallbackImg
                alt={tokenIn.token.denom}
                src={tokenIn.token.currency.coinImageUrl}
                fallbacksrc="/icons/question-mark.svg"
                height={32}
                width={32}
              />
              <div className="flex flex-col">
                <div className="subtitle1">Sold</div>
                <div className="text-body1 text-osmoverse-300">
                  {tokenIn.token.denom}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="text-subtitle1">
                ${Number(tokenIn.usd.toDec().toString()).toFixed(2)}
              </div>
              <div className="text-body1 text-osmoverse-300">
                {formatPretty(tokenIn.token, { maxDecimals: 2 })?.toString()}
              </div>
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
              <FallbackImg
                alt={tokenOut.token.denom}
                src={tokenOut.token.currency.coinImageUrl}
                fallbacksrc="/icons/question-mark.svg"
                height={32}
                width={32}
              />
              <div className="flex flex-col">
                <div className="text-subtitle1">Bought</div>
                <div className="text-body1 text-osmoverse-300">
                  {tokenOut.token.denom}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="text-subtitle1">
                ${Number(tokenOut.usd.toDec().toString()).toFixed(2)}
              </div>
              <div className="text-body1 text-osmoverse-300">
                {formatPretty(tokenOut.token, {
                  maxDecimals: 2,
                })?.toString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col py-3">
          <div className="flex justify-between gap-3 py-3">
            <div>Execution Price</div>
            <div className="flex gap-3">
              <div className="text-body1 text-wosmongton-300">
                1 {tokenOut.token.denom} = {conversionRate}{" "}
                {tokenIn.token.denom}
              </div>
              <CopyIconButton valueToCopy={conversionRate} />
            </div>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <div>Total Fees</div>
            <div className="text-body1 text-wosmongton-300">
              {formatPretty(txFee.token, {
                maxDecimals: 2,
              })?.toString()}
            </div>
          </div>
          <div className="flex justify-between py-3">
            <div>Transaction Fees</div>
            <div className="flex gap-3">
              <div className="text-body1 text-wosmongton-300">
                {getShortAddress(transaction.hash)}
              </div>
              <CopyIconButton valueToCopy={transaction.hash} />
            </div>
          </div>
        </div>
        <Button size="default" variant="secondary" asChild>
          <a
            rel="noreferrer"
            target="_blank"
            href={`https://www.mintscan.io/cosmos/txs/${transaction.hash}`}
          >
            <span>View on Explorer &#x2197;</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export const TransactionDetailsSlideover = ({
  onRequestClose,
  open,
  transaction,
}: {
  onRequestClose: () => void;
  open: boolean;
  transaction: FormattedTransaction;
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
      <TransactionDetailsContent
        onRequestClose={onRequestClose}
        isModal={false}
        transaction={transaction}
      />
    </Transition>
  );
};

export const TransactionDetailsModal: FunctionComponent<
  ModalBaseProps & { transaction: FormattedTransaction }
> = ({ onRequestClose, isOpen, transaction }) => {
  return (
    <ModalBase isOpen={isOpen} onRequestClose={onRequestClose}>
      <TransactionDetailsContent
        onRequestClose={onRequestClose}
        isModal={true}
        transaction={transaction}
      />
    </ModalBase>
  );
};
