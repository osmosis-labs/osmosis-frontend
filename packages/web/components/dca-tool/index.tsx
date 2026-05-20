import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import {
  AssetFieldset,
  AssetFieldsetFooter,
  AssetFieldsetHeader,
  AssetFieldsetHeaderBalance,
  AssetFieldsetHeaderLabel,
  AssetFieldsetInput,
  AssetFieldsetTokenSelector,
} from "~/components/complex/asset-fieldset";
import { DcaActiveVaults } from "~/components/dca-tool/dca-active-vaults";
import { Button } from "~/components/ui/button";
import { EventPage } from "~/config";
import { useDisclosure, useTranslation, useWalletSelect } from "~/hooks";
import { useDca } from "~/hooks/dca/use-dca";
import { AddFundsModal } from "~/modals/add-funds";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

interface IntervalSliderProps {
  options: { label: string; value: any }[];
  value: any;
  onChange: (value: any) => void;
}

const IntervalSlider: FunctionComponent<IntervalSliderProps> = ({
  options,
  value,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndex = options.findIndex(
    (o) => JSON.stringify(o.value) === JSON.stringify(value)
  );

  const indexFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return activeIndex;
      const { left, width } = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      return Math.round(ratio * (options.length - 1));
    },
    [activeIndex, options.length]
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      onChange(options[indexFromPointer(e.clientX)].value);
    },
    [indexFromPointer, onChange, options]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.buttons === 0) return;
      onChange(options[indexFromPointer(e.clientX)].value);
    },
    [indexFromPointer, onChange, options]
  );

  const pct = (activeIndex / (options.length - 1)) * 100;
  // Half the thumb width in px — used to inset the track so the thumb
  // doesn't visually overhang the label row at the edges.
  const INSET = 24;

  return (
    <div className="flex flex-col gap-3">
      {/* Draggable track — padded so thumb centres sit above the first/last label */}
      <div
        className="relative flex h-6 cursor-pointer items-center"
        style={{ paddingLeft: INSET, paddingRight: INSET }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        {/* The ref sits on the inner track so pointer→index maths uses the right width */}
        <div ref={trackRef} className="relative flex h-full w-full items-center">
          {/* Full track line */}
          <div className="absolute inset-x-0 h-0.5 rounded-full bg-osmoverse-600" />
          {/* Filled portion */}
          <div
            className="absolute left-0 h-0.5 rounded-full bg-wosmongton-400 transition-[width]"
            style={{ width: `${pct}%` }}
          />
          {/* Stop ticks */}
          {options.map((_, i) => (
            <div
              key={i}
              className={classNames(
                "absolute h-1.5 w-0.5 -translate-x-1/2 rounded-full transition-colors",
                i <= activeIndex ? "bg-wosmongton-400" : "bg-osmoverse-500"
              )}
              style={{ left: `${(i / (options.length - 1)) * 100}%` }}
            />
          ))}
          {/* Thumb */}
          <div
            className="absolute h-5 w-5 -translate-x-1/2 rounded-full bg-wosmongton-400 shadow-md ring-4 ring-wosmongton-400/30 transition-[left]"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
      {/* Labels — same horizontal padding as the track so percentages line up with ticks */}
      <div
        className="relative h-4"
        style={{ paddingLeft: INSET, paddingRight: INSET }}
      >
        {options.map((opt, i) => {
          const ratio = i / (options.length - 1);
          return (
            <button
              key={i}
              onClick={() => onChange(opt.value)}
              style={{ left: `${ratio * 100}%` }}
              className={classNames(
                "absolute -translate-x-1/2 whitespace-nowrap text-[10px] leading-none transition-colors",
                i === 0 && "translate-x-0",
                i === options.length - 1 && "-translate-x-full",
                i === activeIndex
                  ? "font-semibold text-white"
                  : "text-osmoverse-400 hover:text-osmoverse-300"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface DcaToolProps {
  page: EventPage;
}

export const DcaTool: FunctionComponent<DcaToolProps> = observer(
  ({ page }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const { onOpenWalletSelect } = useWalletSelect();
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);
    const totalInputEl = useRef<HTMLInputElement | null>(null);

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    const [reviewOpen, setReviewOpen] = useState(false);

    const dcaState = useDca({});
    const {
      sendAsset,
      targetAsset,
      setSendDenom,
      setTargetDenom,
      switchAssets,
      selectableAssets,
      isLoadingSelectAssets,
      hasNextPageAssets,
      isFetchingNextPageAssets,
      fetchNextPageAssets,
      setAssetsQueryInput,
      assetsQueryInput,
      amountRaw,
      setAmountRaw,
      inAmountInput,
      availableBalance,
      estimatedOutput,
      isQuoteLoading,
      tokenOutFiatValue,
      totalRaw,
      setTotalRaw,
      executionCount,
      durationLabel,
      interval,
      setInterval,
      slippageRaw,
      setSlippageRaw,
      minReceiveRaw,
      setMinReceiveRaw,
      startNow,
      setStartNow,
      startTimeUtc,
      setStartTimeUtc,
      perExecError,
      totalError,
      canSubmit,
      createVault,
      isConfirming,
      txError,
      intervalOptions,
    } = dcaState;

    const isWalletConnected = account?.isWalletConnected;

    const selectableFromAssets = useMemo(
      () =>
        selectableAssets.filter(
          (a) => a.coinMinimalDenom !== targetAsset?.coinMinimalDenom
        ),
      [selectableAssets, targetAsset?.coinMinimalDenom]
    );

    const selectableToAssets = useMemo(
      () =>
        selectableAssets.filter(
          (a) => a.coinMinimalDenom !== sendAsset?.coinMinimalDenom
        ),
      [selectableAssets, sendAsset?.coinMinimalDenom]
    );

    const inFiatValue = inAmountInput.fiatValue
      ? formatPretty(
          inAmountInput.fiatValue,
          inAmountInput.fiatValue.toDec().gt(new Dec(0))
            ? getPriceExtendedFormatOptions(inAmountInput.fiatValue.toDec())
            : undefined
        )
      : formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)));

    function handleSubmit() {
      if (!isWalletConnected) {
        onOpenWalletSelect({
          walletOptions: [
            { walletType: "cosmos", chainId: accountStore.osmosisChainId },
          ],
        });
        return;
      }
      if (!canSubmit) return;
      setReviewOpen(true);
    }

    const errorKey = perExecError ?? totalError;
    const buttonLabel = !isWalletConnected
      ? t("connectWallet")
      : errorKey
      ? t(errorKey)
      : sendAsset?.coinMinimalDenom === targetAsset?.coinMinimalDenom
      ? t("dca.sameDenomError")
      : t("dca.createOrder");

    const summaryLine =
      executionCount && durationLabel
        ? t("dca.executionSummary", {
            count: executionCount.toString(),
            duration: durationLabel,
          })
        : null;

    return (
      <div className="flex flex-col gap-3">
        {/* Per-execution amount + asset pair */}
        <div className="relative flex flex-col">
          <AssetFieldset>
            <AssetFieldsetHeader>
              <AssetFieldsetHeaderLabel>
                <span className="body2 py-1.5 text-osmoverse-300">
                  {t("dca.perExecution")}
                </span>
              </AssetFieldsetHeaderLabel>
              <AssetFieldsetHeaderBalance
                onMax={() => {
                  inAmountInput.toggleMax();
                  fromAmountInputEl.current?.focus();
                }}
                availableBalance={availableBalance}
                showAddFundsButton={
                  !isWalletConnected ||
                  !!(
                    inAmountInput.balance &&
                    inAmountInput.balance.toDec().isZero()
                  )
                }
                openAddFundsModal={openAddFundsModal}
                isMaxButtonDisabled={
                  !inAmountInput.balance ||
                  inAmountInput.balance.toDec().isZero()
                }
              />
            </AssetFieldsetHeader>
            <div className="flex items-center justify-between py-3">
              <AssetFieldsetInput
                ref={fromAmountInputEl}
                inputValue={amountRaw}
                onInputChange={(e) => {
                  e.preventDefault();
                  setAmountRaw(e.target.value);
                }}
              />
              <AssetFieldsetTokenSelector
                page={page}
                selectedCoinDenom={sendAsset?.coinDenom}
                selectedCoinImageUrl={sendAsset?.coinImageUrl}
                onSelect={setSendDenom}
                selectableAssets={selectableFromAssets}
                isLoadingSelectAssets={isLoadingSelectAssets}
                hasNextPageAssets={hasNextPageAssets}
                isFetchingNextPageAssets={isFetchingNextPageAssets}
                fetchNextPageAssets={fetchNextPageAssets}
                setAssetQueryInput={setAssetsQueryInput}
                assetQueryInput={assetsQueryInput}
              />
            </div>
            <AssetFieldsetFooter>
              <span
                className={classNames("body2 h-5 text-osmoverse-300", {
                  "!text-osmoverse-600": !inAmountInput.fiatValue,
                })}
              >
                {inFiatValue}
              </span>
            </AssetFieldsetFooter>
          </AssetFieldset>

          {/* Switch assets */}
          <div className="relative flex w-full">
            <div className="absolute top-0 h-0.5 w-full bg-[#3C356D4A]" />
            <button
              className="group absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-solid border-[#3C356D4A] bg-osmoverse-900"
              onClick={() => {
                switchAssets();
                setAmountRaw("");
              }}
            >
              <Icon
                id="switch"
                className="h-6 w-6 text-wosmongton-200 transition-transform group-hover:rotate-180"
              />
            </button>
          </div>

          {/* Estimated receive per execution */}
          <AssetFieldset>
            <AssetFieldsetHeader>
              <AssetFieldsetHeaderLabel>
                <span className="body2 py-1.5 text-osmoverse-300">
                  {t("dca.to")}
                </span>
              </AssetFieldsetHeaderLabel>
            </AssetFieldsetHeader>
            <div className="flex items-center justify-between py-3">
              <AssetFieldsetInput
                inputValue={estimatedOutput}
                onInputChange={() => {}}
                disabled
                wrapperClassNames={classNames({
                  "opacity-50": isQuoteLoading,
                })}
              />
              <AssetFieldsetTokenSelector
                page={page}
                selectedCoinDenom={targetAsset?.coinDenom}
                selectedCoinImageUrl={targetAsset?.coinImageUrl}
                onSelect={setTargetDenom}
                selectableAssets={selectableToAssets}
                isLoadingSelectAssets={isLoadingSelectAssets}
                hasNextPageAssets={hasNextPageAssets}
                isFetchingNextPageAssets={isFetchingNextPageAssets}
                fetchNextPageAssets={fetchNextPageAssets}
                setAssetQueryInput={setAssetsQueryInput}
                assetQueryInput={assetsQueryInput}
              />
            </div>
            <AssetFieldsetFooter>
              <span
                className={classNames("body2 h-5 text-osmoverse-300", {
                  "!text-osmoverse-600":
                    !tokenOutFiatValue || tokenOutFiatValue.toDec().isZero(),
                })}
              >
                {tokenOutFiatValue ? formatPretty(tokenOutFiatValue) : ""}
              </span>
            </AssetFieldsetFooter>
          </AssetFieldset>
        </div>

        {estimatedOutput && (
          <p className="caption text-osmoverse-400">
            {t("dca.estimatedFirstExecution")}
          </p>
        )}

        {/* Interval slider */}
        <div className="flex flex-col gap-1 rounded-2xl bg-osmoverse-800 px-4 py-4">
          <div className="flex items-center justify-between pb-1">
            <span className="body2 text-osmoverse-200">{t("dca.every")}</span>
            <span className="body2 font-semibold text-white">
              {intervalOptions.find(
                (o) => JSON.stringify(o.value) === JSON.stringify(interval)
              )?.label ?? ""}
            </span>
          </div>
          <IntervalSlider
            options={intervalOptions}
            value={interval}
            onChange={setInterval}
          />
        </div>

        {/* Total deposit */}
        <div className="flex items-center justify-between rounded-2xl bg-osmoverse-800 px-4 py-3">
          <span className="body2 text-osmoverse-200">
            {t("dca.totalDeposit")}
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={totalInputEl}
              type="number"
              min="0"
              value={totalRaw}
              onChange={(e) => setTotalRaw(e.target.value)}
              placeholder="0"
              className="w-32 rounded-lg bg-osmoverse-700 px-3 py-1.5 text-right text-base text-white placeholder:text-osmoverse-500"
            />
            <span className="body2 text-osmoverse-400">
              {sendAsset?.coinDenom ?? ""}
            </span>
          </div>
        </div>

        {/* Execution summary */}
        {summaryLine && (
          <p className="caption text-center text-osmoverse-400">{summaryLine}</p>
        )}

        {/* Advanced options */}
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center gap-1 self-start caption text-wosmongton-200 hover:text-wosmongton-100">
                <span>{t("dca.advancedOptions")}</span>
                <Icon
                  id="chevron-down"
                  width={12}
                  height={12}
                  className={classNames("transition-transform", {
                    "rotate-180": open,
                  })}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="flex flex-col gap-2">
                {/* Slippage */}
                <div className="flex items-center justify-between rounded-2xl bg-osmoverse-800 px-4 py-3">
                  <span className="body2 text-osmoverse-200">
                    {t("dca.slippageTolerance")}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={
                        // Display slippage as a percentage with one decimal.
                        // slippageRaw is stored as a fractional Dec string
                        // (e.g. "0.01" = 1%), so multiply by 100.
                        new Dec(slippageRaw || "0")
                          .mul(new Dec(100))
                          .toString(1)
                      }
                      onChange={(e) => {
                        // Convert percentage input back to fractional Dec
                        // without going through JS floats.
                        const pct = e.target.value;
                        if (!pct) {
                          setSlippageRaw("0");
                          return;
                        }
                        setSlippageRaw(
                          new Dec(pct).quo(new Dec(100)).toString()
                        );
                      }}
                      className="w-16 rounded-lg bg-osmoverse-700 px-2 py-1 text-right text-sm text-white"
                    />
                    <span className="body2 text-osmoverse-400">%</span>
                  </div>
                </div>

                {/* Min receive */}
                <div className="flex items-center justify-between rounded-2xl bg-osmoverse-800 px-4 py-3">
                  <span className="body2 text-osmoverse-200">
                    {t("dca.minReceive")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={minReceiveRaw}
                    onChange={(e) => setMinReceiveRaw(e.target.value)}
                    placeholder={t("dca.optional")}
                    className="w-32 rounded-lg bg-osmoverse-700 px-2 py-1 text-right text-sm text-white placeholder:text-osmoverse-500"
                  />
                </div>

                {/* Start time */}
                <div className="flex items-center gap-4 rounded-2xl bg-osmoverse-800 px-4 py-3">
                  <span className="body2 text-osmoverse-200">
                    {t("dca.startTime")}
                  </span>
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="radio"
                      checked={startNow}
                      onChange={() => setStartNow(true)}
                      className="accent-wosmongton-500"
                    />
                    <span className="body2 text-osmoverse-300">
                      {t("dca.startNow")}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="radio"
                      checked={!startNow}
                      onChange={() => setStartNow(false)}
                      className="accent-wosmongton-500"
                    />
                    <span className="body2 text-osmoverse-300">
                      {t("dca.startAt")}
                    </span>
                  </label>
                  {!startNow && (
                    <div className="flex flex-col gap-1">
                      <input
                        type="datetime-local"
                        value={
                          startTimeUtc
                            ? startTimeUtc.toISOString().slice(0, 16)
                            : ""
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          // datetime-local returns wall time with no offset;
                          // append Z so the date is parsed as UTC, matching
                          // the variable name and what the contract expects.
                          setStartTimeUtc(
                            e.target.value
                              ? new Date(e.target.value + "Z")
                              : undefined
                          )
                        }
                        className="rounded-lg bg-osmoverse-700 px-2 py-1 text-sm text-white"
                      />
                      <span className="caption text-osmoverse-400">
                        {t("dca.startAtUtcNote")}
                      </span>
                    </div>
                  )}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {txError && (
          <p className="caption text-center text-rust-300">{txError}</p>
        )}

        {/* Submit / confirm */}
        {reviewOpen ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-osmoverse-800 p-4">
            <p className="subtitle1 text-white">{t("dca.confirmTitle")}</p>
            <div className="caption flex flex-col gap-1 text-osmoverse-300">
              <div className="flex justify-between">
                <span>{t("dca.confirmTotal")}</span>
                <span>
                  {totalRaw} {sendAsset?.coinDenom}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("dca.confirmPerExec")}</span>
                <span>
                  {amountRaw} {sendAsset?.coinDenom} →{" "}
                  {targetAsset?.coinDenom}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("dca.confirmInterval", { interval: "" }).trim()}</span>
                <span>
                  {intervalOptions.find(
                    (o) =>
                      JSON.stringify(o.value) === JSON.stringify(interval)
                  )?.label ?? ""}
                </span>
              </div>
              {summaryLine && (
                <div className="flex justify-between">
                  <span>{t("dca.confirmDuration")}</span>
                  <span>{summaryLine}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setReviewOpen(false)}
                disabled={isConfirming}
              >
                {t("limitOrders.cancel")}
              </Button>
              <Button
                className="flex-1"
                isLoading={isConfirming}
                onClick={() => createVault(() => setReviewOpen(false))}
              >
                {t("dca.confirm")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            disabled={isWalletConnected ? !canSubmit || isConfirming : false}
            isLoading={isConfirming}
            onClick={handleSubmit}
          >
            <h6>{buttonLabel}</h6>
          </Button>
        )}

        {isWalletConnected && <DcaActiveVaults />}

        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onRequestClose={closeAddFundsModal}
        />
      </div>
    );
  }
);
