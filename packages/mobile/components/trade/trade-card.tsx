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
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
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
  searchValue?: string;
  onSearch?: (query: string) => void;
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
    searchValue,
    onSearch,
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
          onDismiss={() => {
            onSearch?.("");
          }}
        >
          <TradeBottomSheetContent
            onSelectAsset={(asset) => {
              onSelectAsset(asset);
              selectAssetBottomSheetRef.current?.dismiss();
            }}
            selectableAssets={selectableAssets}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoadingSelectAssets={isLoadingSelectAssets}
            recommendedAssets={recommendedAssets}
            searchValue={searchValue}
            onSearch={onSearch}
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
        <View style={styles.amountContainer}>
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
            style={[
              styles.amountInput,
              isSwapToolLoading && disabled && styles.amountInputDisabled,
            ]}
            editable={!disabled}
            contextMenuHidden={true}
            caretHidden={true}
          />
          <Text style={styles.fiatValue}>
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

        <View style={styles.assetContainer}>
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
  amountContainer: {
    flex: 1,
    gap: 4,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "500",
    color: "#ffffff",
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
