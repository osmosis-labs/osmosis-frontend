import { Dec } from "@osmosis-labs/unit";
import classNames from "classnames";
import { FunctionComponent, useCallback, useState } from "react";

import { Icon } from "~/components/assets";
import { AutosizeInput } from "~/components/input/autosize-input";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { RecapRow } from "~/components/ui/recap-row";
import { HighSlippageToleranceGate } from "~/config/trade-warnings";
import { useTranslation } from "~/hooks";
import type { SlippageConfig } from "~/hooks/ui-config/use-slippage-config";
import { SlippageSource } from "~/utils/slippage";
import { formatSlippagePercent, parseSlippageInput } from "~/utils/swap-review";

/**
 * Typed-slippage state for a slippage tolerance row. Kept in a hook, not the
 * row, so the owner can clear the typed value when its surface closes.
 *
 * The field holds a percentage string ("5"); the config holds the submitted
 * fraction (0.05). Clearing the field hands control back to the caller's own
 * slippage, which the placeholder always shows.
 */
export function useSlippageToleranceInput({
  slippageConfig,
  slippageSource,
}: {
  slippageConfig: SlippageConfig | undefined;
  /** Where the submitted slippage came from, when the caller chooses it
   *  automatically. */
  slippageSource?: SlippageSource;
}) {
  const [manualSlippage, setManualSlippage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // This warning and the caller's acknowledgement checkbox must read the same
  // number (both compare against HighSlippageToleranceGate). While they did
  // not, any tolerance between two thresholds showed a loss warning with
  // nothing to acknowledge and no gate behind it. Note the unit difference:
  // the typed value is a percentage string ("5"), the config's a fraction.
  const manualSlippagePercent = Number(manualSlippage);
  const effectiveSlippage = manualSlippage
    ? new Dec(
        Number.isFinite(manualSlippagePercent)
          ? manualSlippagePercent.toString()
          : "0"
      ).quo(new Dec(100))
    : slippageConfig?.slippage.toDec();
  const isTooHigh = effectiveSlippage?.gte(HighSlippageToleranceGate) ?? false;
  const isTooLow = manualSlippage !== "" && +manualSlippage < 0.1;

  const clearTypedSlippage = useCallback(() => setManualSlippage(""), []);

  const onChange = useCallback(
    (value: string) => {
      const parsed = parseSlippageInput(value);
      if (!parsed) return;

      setManualSlippage(parsed.display);
      if (parsed.display === "") {
        // Clearing hands control back to the tool's own slippage, shown as
        // the placeholder. A caller that sets slippage automatically picks it
        // up from the cleared override; otherwise fall back to the preset
        // (or one the fee-error path selected).
        slippageConfig?.clearUserOverride();
        if (slippageSource === undefined) {
          slippageConfig?.setIsManualSlippage(false);
        }
      } else if (parsed.commit !== undefined) {
        slippageConfig?.markUserOverride();
        slippageConfig?.setManualSlippage(parsed.commit);
      }
    },
    [slippageConfig, slippageSource]
  );

  // Leaving the field with an incomplete value ("1.", "0", "0.") must not
  // leave the display out of step with the submitted tolerance: complete a
  // positive value, otherwise clear it.
  const onBlur = useCallback(() => {
    setIsEditing(false);
    if (manualSlippage === "") return;
    if (parseSlippageInput(manualSlippage)?.commit !== undefined) return;

    const value = Number(manualSlippage);
    if (value > 0) {
      setManualSlippage(String(value));
      slippageConfig?.markUserOverride();
      slippageConfig?.setManualSlippage(String(value));
    } else {
      setManualSlippage("");
      slippageConfig?.clearUserOverride();
      if (slippageSource === undefined) {
        slippageConfig?.setIsManualSlippage(false);
      }
    }
  }, [manualSlippage, slippageConfig, slippageSource]);

  return {
    manualSlippage,
    isEditing,
    setIsEditing,
    onChange,
    onBlur,
    clearTypedSlippage,
    isTooHigh,
    isTooLow,
  };
}

export type SlippageToleranceInput = ReturnType<
  typeof useSlippageToleranceInput
>;

/**
 * The swap review's slippage tolerance row: the editable tolerance (its
 * placeholder is what will be submitted), the auto-adjusted marker, the
 * unknown-route-liquidity note, and the high and low tolerance warnings.
 */
export const SlippageToleranceRow: FunctionComponent<{
  slippageConfig: SlippageConfig;
  input: SlippageToleranceInput;
  slippageSource?: SlippageSource;
  /** True when an automatic slippage was chosen without knowing the route's
   *  liquidity. */
  slippageLiquidityUnknown?: boolean;
}> = ({
  slippageConfig,
  input,
  slippageSource,
  slippageLiquidityUnknown = false,
}) => {
  const { t } = useTranslation();
  const {
    manualSlippage,
    isEditing,
    setIsEditing,
    onChange,
    onBlur,
    isTooHigh,
    isTooLow,
  } = input;

  // An auto-adjusted tolerance, and one picked without knowing route
  // liquidity, are noted only while the user has not typed their own.
  const showAutoAdjusted = manualSlippage === "" && slippageSource === "auto";
  const showLiquidityUnknown =
    manualSlippage === "" &&
    slippageLiquidityUnknown &&
    (slippageSource === "auto" || slippageSource === "default");

  return (
    <div className="flex flex-col gap-3">
      <RecapRow
        left={t("swap.settings.slippage")}
        right={
          <div className="flex items-center justify-end gap-2">
            {showAutoAdjusted && (
              <GenericDisclaimer
                title={t("swap.slippageAutoAdjustedTitle")}
                body={t("swap.slippageAutoAdjustedBody")}
              >
                <Icon
                  id="alert-triangle"
                  label={t("swap.slippageAutoAdjustedTitle")}
                  width={16}
                  height={16}
                  className="text-ammelia-400"
                />
              </GenericDisclaimer>
            )}
            <div
              className={classNames(
                "flex w-fit items-center justify-center overflow-hidden rounded-lg py-1.5 pl-2 text-center transition-all sm:-my-0.5 sm:h-7",
                isEditing
                  ? "border-2 border-solid border-wosmongton-300 bg-osmoverse-900 pr-2"
                  : "border border-osmoverse-700 bg-osmoverse-850 pr-2"
              )}
            >
              <AutosizeInput
                type="text"
                inputMode="decimal"
                minWidth={30}
                placeholder={
                  // The tolerance that will be submitted, not a
                  // nominal default.
                  formatSlippagePercent(slippageConfig.slippage.toDec()) + "%"
                }
                className="sm:caption w-fit bg-transparent px-0"
                inputClassName={classNames(
                  "!bg-transparent focus:text-center text-right placeholder:text-wosmongton-300 transition-all focus-visible:outline-none",
                  {
                    "text-rust-400 placeholder:text-rust-400": isTooHigh,
                  }
                )}
                value={manualSlippage}
                onFocus={() => setIsEditing(true)}
                onBlur={onBlur}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
              />
              {manualSlippage !== "" && (
                <span
                  className={classNames({
                    "text-rust-400": isTooHigh,
                  })}
                >
                  %
                </span>
              )}
            </div>
          </div>
        }
      />
      {showLiquidityUnknown && (
        <p className="caption text-ammelia-400">
          {t("swap.routeLiquidityUnknown")}
        </p>
      )}
      {isTooHigh && (
        <div className="flex items-start gap-3 rounded-3x4pxlinset border-2 border-solid border-rust-500 px-5 py-2.5">
          <Icon
            id="alert-triangle"
            width={24}
            height={24}
            className="text-rust-400"
          />
          <div className="flex flex-col gap-1">
            <span className="body2 sm:caption">
              {t("limitOrders.errors.tradeMayResultInLossOfValue")}
            </span>
            <span className="body2 sm:caption text-osmoverse-300">
              {showAutoAdjusted
                ? t("swap.slippageAutoAdjustedHigh")
                : t("limitOrders.lowerSlippageToleranceRecommended")}
            </span>
          </div>
        </div>
      )}
      {isTooLow && (
        <div className="flex items-start gap-3 rounded-3x4pxlinset border-2 border-solid border-osmoverse-alpha-800/[.54] p-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM13.5 7.49976C13.5 8.32818 12.8284 8.99976 12 8.99976C11.1716 8.99976 10.5 8.32818 10.5 7.49976C10.5 6.67133 11.1716 5.99976 12 5.99976C12.8284 5.99976 13.5 6.67133 13.5 7.49976ZM11.25 10.4998C10.8358 10.4998 10.5 10.8355 10.5 11.2498V17.2498C10.5 17.664 10.8358 17.9998 11.25 17.9998H12.75C13.1642 17.9998 13.5 17.664 13.5 17.2498V11.2498C13.5 10.8355 13.1642 10.4998 12.75 10.4998H11.25Z"
              fill="#736CA3"
            />
          </svg>
          <div className="flex flex-col gap-1">
            <span className="body2 sm:caption">
              {t("limitOrders.errors.tradeMayNotExecuted")}
            </span>
            <span className="body2 sm:caption text-osmoverse-300">
              {t("limitOrders.tryHigherSlippage")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
