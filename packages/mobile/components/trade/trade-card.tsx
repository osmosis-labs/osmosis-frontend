import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { MinimalAsset } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { PricePretty } from "@osmosis-labs/unit";
import {
  DEFAULT_VS_CURRENCY,
  formatPretty,
  getPriceExtendedFormatOptions,
  trimPlaceholderZeros,
} from "@osmosis-labs/utils";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { PlusIcon } from "~/components/icons/plus-icon";
import { TradeBottomSheetContent } from "~/components/trade/trade-bottom-sheet-content";
import { useInputSelectionStore } from "~/components/trade/trade-interface";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import {
  UseSwapAmountInputReturn,
  UseSwapAssetsReturn,
} from "~/hooks/use-swap";

type TradeCardProps = {
  title: string;
  subtitle: string;
  asset: UseSwapAssetsReturn["fromAsset"] | undefined;
  onSelectAsset: (
    asset: UseSwapAssetsReturn["selectableAssets"][number]
  ) => void;
  selectableAssets: UseSwapAssetsReturn["selectableAssets"];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingSelectAssets: boolean;
  recommendedAssets: MinimalAsset[] | undefined;
  amountInput: UseSwapAmountInputReturn;
  onPressMax?: () => void;
  disabled?: boolean;
  isSwapToolLoading: boolean;
};

export const TradeCard = memo(
  ({
    title,
    subtitle,
    asset,
    onSelectAsset,
    selectableAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoadingSelectAssets,
    recommendedAssets,
    amountInput,
    onPressMax,
    disabled,
    isSwapToolLoading,
  }: TradeCardProps) => {
    const selectAssetBottomSheetRef = useRef<BottomSheetModal>(null);

    return (
      <>
        {asset ? (
          <SelectedAssetCard
            asset={asset}
            amountInput={amountInput}
            onPressAsset={() => {
              selectAssetBottomSheetRef.current?.present();
            }}
            onPressMax={onPressMax}
            disabled={disabled}
            isSwapToolLoading={isSwapToolLoading}
          />
        ) : (
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
        )}

        <BottomSheetModal
          ref={selectAssetBottomSheetRef}
          enablePanDownToClose
          index={0}
          snapPoints={["60%", "93%"]}
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
        >
          <TradeBottomSheetContent
            onSelectAsset={onSelectAsset}
            selectableAssets={selectableAssets}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoadingSelectAssets={isLoadingSelectAssets}
            recommendedAssets={recommendedAssets}
          />
        </BottomSheetModal>
      </>
    );
  }
);

const SelectedAssetCard = memo(
  ({
    asset,
    amountInput,
    onPressAsset,
    onPressMax,
    disabled,
    isSwapToolLoading,
  }: {
    asset: NonNullable<UseSwapAssetsReturn["fromAsset"]>;
    amountInput: UseSwapAmountInputReturn;
    onPressAsset: () => void;
    onPressMax?: () => void;
    disabled?: boolean;
    isSwapToolLoading: boolean;
  }) => {
    const setSelection = useInputSelectionStore((state) => state.setSelection);
    const inputRef = useRef<TextInput>(null);

    const loadingMaxButton =
      !amountInput.hasErrorWithCurrentBalanceQuote &&
      !amountInput?.balance?.toDec().isZero() &&
      amountInput.isLoadingCurrentBalanceNetworkFee;

    useEffect(() => {
      if (!disabled) {
        inputRef.current?.focus();
      }
    }, [amountInput.amount, disabled]);

    return (
      <View style={styles.tradeCard}>
        <View style={{ flex: 1, gap: 4 }}>
          <TextInput
            ref={inputRef}
            value={
              disabled && amountInput.amount
                ? trimPlaceholderZeros(
                    formatPretty(amountInput.amount?.toDec(), {
                      minimumSignificantDigits: 6,
                      maximumSignificantDigits: 6,
                      maxDecimals: 10,
                      notation: "standard",
                    })
                  ).replace(/,/g, "")
                : amountInput.inputAmount
            }
            onChangeText={amountInput.setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors["osmoverse"][400]}
            showSoftInputOnFocus={false}
            selectionColor={Colors["osmoverse"][400]}
            style={{
              fontSize: 36,
              fontWeight: "500",
              color: "#ffffff",
              opacity: isSwapToolLoading && disabled ? 0.5 : 1,
            }}
            editable={!disabled}
            contextMenuHidden={true}
            onSelectionChange={(event) =>
              setSelection(event.nativeEvent.selection)
            }
          />
          <Text style={{ color: Colors["osmoverse"][300] }}>
            {formatPretty(
              amountInput.fiatValue ??
                new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
              amountInput.fiatValue?.toDec() && {
                ...getPriceExtendedFormatOptions(
                  amountInput.fiatValue?.toDec()
                ),
              }
            )}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", gap: 5 }}>
          <TouchableOpacity
            style={styles.assetLeft}
            onPress={onPressAsset}
            activeOpacity={0.8}
          >
            {asset.coinImageUrl && (
              <AssetImage uri={asset.coinImageUrl} style={styles.assetIcon} />
            )}
            <View>
              <Text style={styles.assetDenom}>{asset.coinDenom}</Text>
            </View>
          </TouchableOpacity>
          {onPressMax && asset.amount && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={{ color: Colors["osmoverse"][300] }}>
                {formatPretty(asset.amount)}
              </Text>
              <Skeleton
                isLoaded={!loadingMaxButton}
                style={{
                  backgroundColor: Colors["osmoverse"][700],
                  borderRadius: 255,
                }}
              >
                <Button
                  title="Max"
                  onPress={onPressMax}
                  textStyle={{ fontSize: 12, fontWeight: 600 }}
                  buttonStyle={{
                    paddingVertical: 4,
                    paddingHorizontal: 6,
                  }}
                />
              </Skeleton>
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
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
});