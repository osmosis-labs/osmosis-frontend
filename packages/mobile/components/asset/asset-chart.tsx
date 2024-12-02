import { Dec, RatePretty } from "@osmosis-labs/unit";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { runOnJS, useDerivedValue } from "react-native-reanimated";
import { LineChart, TLineChartPoint } from "react-native-wagmi-charts";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { SubscriptDecimal } from "~/components/subscript-decimal";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { getChangeColor } from "~/utils/price";
import { api, RouterOutputs } from "~/utils/trpc";

export const AvailablePriceRanges = {
  "1h": "1h",
  "1d": "1d",
  "7d": "7d",
  "1mo": "1mo",
  "1y": "1y",
  all: "all",
} as const;

export type PriceRange =
  (typeof AvailablePriceRanges)[keyof typeof AvailablePriceRanges];

const AssetChartAvailableDataTypes = ["price", "volume"] as const;

type AssetChartDataType = (typeof AssetChartAvailableDataTypes)[number];

interface SelectedPointState {
  selectedPoint: TLineChartPoint | null;
  setSelectedPoint: (point: TLineChartPoint | null) => void;
  timeFrame: string;
  setTimeFrame: (frame: string) => void;
  priceChangeOverride: RatePretty | undefined;
  setPriceChangeOverride: (priceChange: RatePretty | undefined) => void;
}

export const useAssetChartSelectedPointStore = create<SelectedPointState>(
  (set) => ({
    selectedPoint: null,
    setSelectedPoint: (point) => set({ selectedPoint: point }),
    timeFrame: "7d",
    setTimeFrame: (frame) => set({ timeFrame: frame }),
    priceChangeOverride: undefined,
    setPriceChangeOverride: (priceChange) =>
      set({ priceChangeOverride: priceChange }),
  })
);

export const AssetChart = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAsset"];
}) => {
  const [parentWidth, setParentWidth] = useState<number>();

  const { setSelectedPoint } = useAssetChartSelectedPointStore(
    useShallow((state) => ({
      setSelectedPoint: state.setSelectedPoint,
    }))
  );
  const [dataType] = useState<AssetChartDataType>("price");
  const [timeFrame, setTimeFrame] = useAssetChartSelectedPointStore(
    useShallow((state) => [state.timeFrame, state.setTimeFrame])
  );
  const [priceChangeOverride, setPriceChangeOverride] =
    useAssetChartSelectedPointStore(
      useShallow((state) => [
        state.priceChangeOverride,
        state.setPriceChangeOverride,
      ])
    );

  useEffect(() => {
    if (!timeFrame) setTimeFrame("7d");
  }, [setTimeFrame, timeFrame]);

  const customTimeFrame = useMemo(() => {
    let frame = 60;
    let numRecentFrames: number | undefined = undefined;

    switch ((timeFrame ?? "7d") as PriceRange) {
      case "1h":
        frame = 5;
        numRecentFrames = 14;
        break;
      case "1d":
        frame = 15;
        numRecentFrames = 97;
        break;
      case "7d":
        frame = dataType === "price" ? 60 : 720;
        numRecentFrames = dataType === "price" ? 168 : 15;
        break;
      case "1mo":
        frame = dataType === "price" ? 240 : 1440;
        numRecentFrames = dataType === "price" ? 180 : 30;
        break;
      case "1y":
        frame = dataType === "price" ? 1440 : 10080;
        numRecentFrames = dataType === "price" ? 365 : 54;
        break;
      case "all":
        frame = dataType === "price" ? 10080 : 43800;
        break;
    }

    return {
      timeFrame: frame,
      numRecentFrames,
    };
  }, [dataType, timeFrame]);

  const {
    data: historicalPriceData,
    isLoading: isHistoricalPriceDataLoading,
    isError: isHistoricalPriceDataError,
  } = api.local.assets.getAssetHistoricalPrice.useQuery(
    {
      coinMinimalDenom: asset?.coinMinimalDenom ?? asset?.coinDenom ?? "",
      timeFrame: {
        custom: customTimeFrame,
      },
    },
    {
      enabled: Boolean(asset?.coinMinimalDenom ?? asset?.coinDenom),
      staleTime: 1000 * 60 * 3, // 3 minutes
      cacheTime: 1000 * 60 * 6, // 6 minutes
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const points = useMemo<TLineChartPoint[] | undefined>(() => {
    return historicalPriceData?.map((point) => ({
      timestamp: point.time,
      value: dataType === "price" ? point.close : point.volume,
    }));
  }, [historicalPriceData, dataType]);

  useEffect(() => {
    if (!(timeFrame === "1mo" || timeFrame === "1y" || timeFrame === "all")) {
      setPriceChangeOverride(undefined);
      return;
    }

    const lastPoint = points?.[points.length - 1];
    const firstPoint = points?.[0];
    if (points && lastPoint && firstPoint) {
      setPriceChangeOverride(
        new RatePretty((lastPoint.value - firstPoint.value) / lastPoint.value)
      );
    }
  }, [points, setPriceChangeOverride, timeFrame]);

  const changeColor = useMemo(() => {
    let change: RatePretty | undefined;
    if (timeFrame === "1h") {
      change = asset.priceChange1h;
    } else if (timeFrame === "1d") {
      change = asset.priceChange24h;
    } else if (timeFrame === "7d") {
      change = asset.priceChange7d;
    } else {
      change = priceChangeOverride;
    }

    return getChangeColor(change?.toDec() ?? new Dec(0));
  }, [
    asset.priceChange1h,
    asset.priceChange24h,
    asset.priceChange7d,
    priceChangeOverride,
    timeFrame,
  ]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  };

  return (
    <View onLayout={onLayout}>
      {/* // TODO: Add skeleton */}
      {isHistoricalPriceDataLoading || !points || !parentWidth ? (
        <ActivityIndicator />
      ) : (
        <View>
          <LineChart.Provider
            data={points}
            onCurrentIndexChange={(index) => {
              setSelectedPoint(points[index]);
            }}
          >
            <InnerChartConsumer />
            <LineChart width={parentWidth}>
              <LineChart.Path color={changeColor}>
                <LineChart.Gradient />
              </LineChart.Path>
              <LineChart.CursorLine />
              <LineChart.CursorCrosshair
                color={changeColor}
                onActivated={() => {
                  if (process.env.EXPO_OS === "ios") {
                    // Add a soft haptic feedback when pressing down on the tabs.
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                onEnded={() => {
                  if (process.env.EXPO_OS === "ios") {
                    // Add a soft haptic feedback when pressing down on the tabs.
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            </LineChart>
          </LineChart.Provider>
        </View>
      )}

      <View style={styles.timeFrameButtons}>
        <Button
          title="1D"
          onPress={() => {
            setTimeFrame("1d");
          }}
          variant={timeFrame === "1d" ? "primary" : "secondary"}
          buttonStyle={styles.timeFrameButton}
        />
        <Button
          title="7D"
          onPress={() => {
            setTimeFrame("7d");
          }}
          variant={timeFrame === "7d" ? "primary" : "secondary"}
          buttonStyle={styles.timeFrameButton}
        />
        <Button
          title="1M"
          onPress={() => {
            setTimeFrame("1mo");
          }}
          variant={timeFrame === "1mo" ? "primary" : "secondary"}
          buttonStyle={styles.timeFrameButton}
        />
        <Button
          title="1Y"
          onPress={() => {
            setTimeFrame("1y");
          }}
          variant={timeFrame === "1y" ? "primary" : "secondary"}
          buttonStyle={styles.timeFrameButton}
        />
        <Button
          title="ALL"
          onPress={() => {
            setTimeFrame("all");
          }}
          variant={timeFrame === "all" ? "primary" : "secondary"}
          buttonStyle={styles.timeFrameButton}
        />
      </View>
    </View>
  );
};

const InnerChartConsumer = () => {
  const { setSelectedPoint } = useAssetChartSelectedPointStore(
    useShallow((state) => ({
      setSelectedPoint: state.setSelectedPoint,
    }))
  );

  const { isActive } = LineChart.useChart();

  useDerivedValue(() => {
    if (!isActive.value) runOnJS(setSelectedPoint)(null);
  }, [isActive]);

  return null;
};

export const AssetChartHeader = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAsset"];
}) => {
  const { selectedPoint, timeFrame, priceChangeOverride } =
    useAssetChartSelectedPointStore(
      useShallow((state) => ({
        selectedPoint: state.selectedPoint,
        timeFrame: state.timeFrame,
        priceChangeOverride: state.priceChangeOverride,
      }))
    );

  return (
    <View style={styles.assetPriceContainer}>
      <Text type="title">
        {asset.currentPrice?.symbol}
        {asset.currentPrice || selectedPoint ? (
          <SubscriptDecimal
            decimal={
              selectedPoint
                ? new Dec(selectedPoint?.value)
                : asset.currentPrice?.toDec() ?? new Dec(0)
            }
          />
        ) : null}
      </Text>
      {timeFrame === "1h" && asset.priceChange1h && (
        <PriceChange change={asset.priceChange1h} />
      )}
      {timeFrame === "1d" && asset.priceChange24h && (
        <PriceChange change={asset.priceChange24h} />
      )}
      {timeFrame === "7d" && asset.priceChange7d && (
        <PriceChange change={asset.priceChange7d} />
      )}
      {priceChangeOverride && <PriceChange change={priceChangeOverride} />}
    </View>
  );
};

const PriceChange = ({ change }: { change: RatePretty }) => (
  <Text
    type="subtitle"
    style={{
      color: getChangeColor(change.toDec() || new Dec(0)),
      marginBottom: 5,
    }}
  >
    {change.toString()}
  </Text>
);

const styles = StyleSheet.create({
  timeFrameButtons: {
    marginTop: 20,
    flexDirection: "row",
    gap: 4,
  },
  timeFrameButton: { flex: 1 },
  assetPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
});
