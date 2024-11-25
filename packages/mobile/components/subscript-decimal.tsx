import { Dec } from "@keplr-wallet/unit";
import {
  compressZeros,
  FormatOptions,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "@osmosis-labs/utils";
import { FunctionComponent, useCallback, useMemo } from "react";
import { StyleSheet, Text } from "react-native";

/** Displays a decimal with subscript 0s, with unsyled elements, without a root parent element. */
export const SubscriptDecimal: FunctionComponent<{
  decimal: Dec;
  maxDecimals?: number;
  /** Overrides default from result of `getPriceExtendedFormatOptions` */
  formatOptions?: FormatOptions;
}> = ({ decimal: price, maxDecimals = 3, formatOptions }) => {
  const formatOpts = useMemo(
    () => formatOptions ?? getPriceExtendedFormatOptions(price),
    [formatOptions, price]
  );

  const getFormattedPrice = useCallback(
    (
      additionalFormatOpts?: Partial<
        Intl.NumberFormatOptions & { disabledTrimZeros: boolean }
      >
    ) =>
      formatPretty(price, {
        maxDecimals,
        notation: "compact",
        ...formatOpts,
        ...additionalFormatOpts,
      }) || "",
    [maxDecimals, formatOpts, price]
  );

  const { decimalDigits, significantDigits, zeros } = useMemo(
    () => compressZeros(getFormattedPrice({ disabledTrimZeros: false }), false),
    [getFormattedPrice]
  );

  return (
    <>
      {significantDigits}.
      {Boolean(zeros) && (
        <>
          0<Text style={styles.subscript}>{zeros}</Text>
        </>
      )}
      {decimalDigits}
    </>
  );
};

const styles = StyleSheet.create({
  subscript: {
    fontSize: 11,
  },
});
