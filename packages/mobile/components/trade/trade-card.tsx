import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { formatPretty, trimPlaceholderZeros } from "@osmosis-labs/utils";
import equal from "fast-deep-equal";
import React, {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { PlusIcon } from "~/components/icons/plus-icon";
import { TradeBottomSheetContent } from "~/components/trade/trade-bottom-sheet-content";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSwapAmountInput } from "~/hooks/swap/use-swap-amount-input";
import { useSwapAsset } from "~/hooks/swap/use-swap-asset";
import { useSwapAssets } from "~/hooks/swap/use-swap-assets";
import { useSwapStore } from "~/stores/swap";
import { formatFiatValueCompact } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

type TradeCardProps = {
  title: string;
  subtitle: string;
  disabled?: boolean;
  direction: "in" | "out";
  initialToDenom: string;
  initialFromDenom: string;
};

export const TradeCard = memo(
  ({
    title,
    subtitle,
    disabled,
    direction,
    initialToDenom,
    initialFromDenom,
  }: TradeCardProps) => {
    const existingAssetsRef = useRef<
      RouterOutputs["local"]["assets"]["getUserAsset"][]
    >([]);
    const selectAssetBottomSheetRef = useRef<BottomSheetModal>(null);
    const { fromAsset, toAsset } = useSwapStore(
      useShallow((state) => ({
        fromAsset: state.fromAsset,
        toAsset: state.toAsset,
      }))
    );

    const { asset, error } = useSwapAsset({
      direction,
      existingAssets: existingAssetsRef.current,
      minDenomOrSymbol:
        direction === "in"
          ? fromAsset?.coinMinimalDenom ?? initialFromDenom
          : toAsset?.coinMinimalDenom ?? initialToDenom,
    });

    return (
      <>
        {asset ? (
          <SelectedAssetCard
            asset={asset}
            direction={direction}
            onPressAsset={() => {
              selectAssetBottomSheetRef.current?.present();
            }}
            disabled={disabled}
          />
        ) : (
          <Skeleton style={{ borderRadius: 12 }} isLoaded={!!error}>
            <TouchableOpacity
              style={styles.tradeCard}
              activeOpacity={0.8}
              onPress={() => {
                selectAssetBottomSheetRef.current?.present();
              }}
            >
              <View style={styles.addButton}>
                <PlusIcon width={24} height={24} />
              </View>
              <View>
                <Text style={styles.tradeCardTitle}>{title}</Text>
                <Text style={styles.tradeCardSubtitle}>{subtitle}</Text>
              </View>
            </TouchableOpacity>
          </Skeleton>
        )}

        <BottomSheetSelectAsset
          selectAssetBottomSheetRef={selectAssetBottomSheetRef}
          direction={direction}
          existingAssetsRef={existingAssetsRef}
        />
      </>
    );
  }
);

const BottomSheetSelectAsset = memo(
  ({
    selectAssetBottomSheetRef,
    direction,
    existingAssetsRef,
  }: {
    selectAssetBottomSheetRef: React.RefObject<BottomSheetModal>;
    direction: "in" | "out";
    existingAssetsRef: MutableRefObject<
      RouterOutputs["local"]["assets"]["getUserAsset"][]
    >;
  }): JSX.Element => {
    const setAssetSearchInput = useSwapStore(
      (state) => state.setAssetSearchInput
    );

    const { fromAsset, toAsset, switchAssets, setFromAsset, setToAsset } =
      useSwapStore(
        useShallow((state) => ({
          fromAsset: state.fromAsset,
          toAsset: state.toAsset,
          switchAssets: state.switchAssets,
          setFromAsset: state.setFromAsset,
          setToAsset: state.setToAsset,
        }))
      );

    const {
      selectableAssets,
      recommendedAssets,
      isLoadingSelectAssets,
      fetchNextPageAssets: fetchNextPage,
      hasNextPageAssets: hasNextPage,
      isFetchingNextPageAssets: isFetchingNextPage,
    } = useSwapAssets({
      existingAssetsRef,
    });

    return (
      <BottomSheetModal
        ref={selectAssetBottomSheetRef}
        enablePanDownToClose
        index={0}
        snapPoints={["65%", "93%"]}
        enableDynamicSizing={false}
        backdropComponent={useCallback(
          (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          ),
          []
        )}
        handleIndicatorStyle={{
          backgroundColor: Colors["osmoverse"][400],
        }}
        backgroundStyle={{
          backgroundColor: Colors["osmoverse"][900],
        }}
        onDismiss={() => {
          setAssetSearchInput("");
        }}
      >
        <TradeBottomSheetContent
          onSelectAsset={(asset) => {
            const setAsset = () =>
              direction === "in" ? setFromAsset(asset) : setToAsset(asset);

            const oppositeSelectedAsset =
              direction === "in" ? toAsset : fromAsset;
            if (
              asset.coinMinimalDenom === oppositeSelectedAsset?.coinMinimalDenom
            ) {
              switchAssets();
            } else {
              setAsset();
            }

            selectAssetBottomSheetRef.current?.dismiss();
          }}
          selectableAssets={selectableAssets}
          recommendedAssets={recommendedAssets}
          isLoadingSelectAssets={isLoadingSelectAssets}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </BottomSheetModal>
    );
  }
);

const SelectedAssetCard = memo(
  ({
    asset,
    onPressAsset,
    disabled,
    direction,
  }: {
    asset: NonNullable<ReturnType<typeof useSwapAsset>["asset"]>;
    onPressAsset: () => void;
    disabled?: boolean;
    direction: "in" | "out";
  }) => {
    const inputRef = useRef<TextInput>(null);

    const isSwapToolLoading = useSwapStore((state) => state.isSwapToolLoading);
    const amountInput = useSwapAmountInput({
      direction,
    });
    const loadingMaxButton = amountInput?.balance?.toDec().isZero();

    const onPressMax = useCallback(() => {
      amountInput.toggleMax();
    }, [amountInput]);

    const getFontSize = useCallback((value: string) => {
      const length = value?.length || 0;
      if (length >= 12) return 22;
      if (length >= 11) return 24;
      if (length >= 10) return 26;
      if (length >= 9) return 28;
      if (length >= 8) return 30;
      if (length >= 7) return 32;
      return 36;
    }, []);

    const inputValue = useMemo(() => {
      if (disabled && amountInput.amount) {
        return trimPlaceholderZeros(
          formatPretty(amountInput.amount?.toDec(), {
            minimumSignificantDigits: 6,
            maximumSignificantDigits: 6,
            maxDecimals: 10,
            notation: "standard",
          })
        ).replace(/,/g, "");
      }
      return amountInput.inputAmount;
    }, [disabled, amountInput.amount, amountInput.inputAmount]);

    // Calculate the font size based on the input value
    const fontSize = useMemo(() => {
      return getFontSize(inputValue);
    }, [getFontSize, inputValue]);

    useEffect(() => {
      const { inAmountInput, outAmountInput } = useSwapStore.getState();

      if (direction === "in") {
        if (!equal(inAmountInput, amountInput)) {
          useSwapStore.setState({
            inAmountInput: amountInput,
          });
        }
      } else {
        if (!equal(outAmountInput, amountInput)) {
          useSwapStore.setState({
            outAmountInput: amountInput,
          });
        }
      }
    }, [amountInput, direction]);

    useEffect(() => {
      if (!disabled) {
        inputRef.current?.focus();
      }
    }, [amountInput.amount, disabled, amountInput.inputAmount]);

    return (
      <View style={styles.tradeCard}>
        <View style={styles.amountContainer}>
          <TextInput
            ref={inputRef}
            value={inputValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors["osmoverse"][400]}
            showSoftInputOnFocus={false}
            selectionColor={Colors["osmoverse"][400]}
            style={[
              styles.amountInput,
              isSwapToolLoading && disabled && styles.amountInputDisabled,
              { fontSize: fontSize },
            ]}
            editable={!disabled}
            contextMenuHidden={true}
            scrollEnabled={true}
            autoFocus
          />
          <Text style={styles.fiatValue}>
            {formatFiatValueCompact(amountInput.fiatValue)}
          </Text>
        </View>

        <View style={styles.assetContainer}>
          <TouchableOpacity
            style={styles.assetLeft}
            onPress={onPressAsset}
            activeOpacity={0.8}
          >
            {asset.coinImageUrl && (
              <AssetImage
                uri={asset.coinImageUrl}
                width={28}
                height={28}
                style={styles.assetIcon}
              />
            )}
            <View>
              <Text style={styles.assetDenom}>{asset.coinDenom}</Text>
            </View>
          </TouchableOpacity>
          {!disabled && asset.amount && (
            <View style={styles.maxContainer}>
              <Text style={styles.balanceText}>
                {formatPretty(asset.amount)}
              </Text>

              <Button
                title="Max"
                onPress={onPressMax}
                textStyle={styles.maxButtonText}
                disabled={loadingMaxButton}
                buttonStyle={styles.maxButton}
              />
            </View>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  tradeCard: {
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 101,
  },
  addButton: {
    backgroundColor: "#2c2d43",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tradeCardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "300",
  },
  tradeCardSubtitle: {
    color: Colors["osmoverse"][400],
    fontSize: 16,
    fontWeight: "300",
  },
  amountContainer: {
    flex: 1,
    gap: 2,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "500",
    color: "#ffffff",
    width: "100%",
    minHeight: 43,
  },
  amountInputDisabled: {
    opacity: 0.5,
  },
  fiatValue: {
    color: Colors["osmoverse"][300],
  },
  assetContainer: {
    alignItems: "flex-end",
    gap: 5,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderColor: Colors["osmoverse"][700],
    borderWidth: 1,
    borderRadius: 255,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 8,
  },
  assetIcon: {
    width: 28,
    height: 28,
    borderRadius: 20,
  },
  assetDenom: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  maxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceText: {
    color: Colors["osmoverse"][300],
  },
  maxButtonSkeleton: {
    backgroundColor: Colors["osmoverse"][700],
    borderRadius: 255,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  maxButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
});
