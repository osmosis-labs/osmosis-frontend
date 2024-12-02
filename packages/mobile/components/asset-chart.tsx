import { Dec } from "@osmosis-labs/unit";
import * as Haptics from "expo-haptics";
import { transparentize } from "polished";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GraphPoint, LineGraph } from "react-native-graph";
import { useMMKVString } from "react-native-mmkv";
import { create } from "zustand";

import { Button } from "~/components/ui/button";
import { Colors } from "~/constants/theme-colors";
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
  selectedPoint: GraphPoint | null;
  setSelectedPoint: (point: GraphPoint | null) => void;
}

export const useAssetChartSelectedPointStore = create<SelectedPointState>(
  (set) => ({
    selectedPoint: null,
    setSelectedPoint: (point) => set({ selectedPoint: point }),
  })
);

export const AssetChart = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAsset"];
}) => {
  const setSelectedPoint = useAssetChartSelectedPointStore(
    (state) => state.setSelectedPoint
  );
  const [dataType] = useState<AssetChartDataType>("price");
  const [timeFrame, setTimeFrame] = useMMKVString("asset-chart-time-frame");

  useEffect(() => {
    if (!timeFrame) setTimeFrame("7d");
  }, []);

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
  }, [asset?.coinMinimalDenom, asset?.coinDenom, timeFrame]);

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

  const points = useMemo<GraphPoint[]>(() => {
    if (!historicalPriceData) return [];
    return historicalPriceData?.map((point) => ({
      date: new Date(point.time),
      value: dataType === "price" ? point.close : point.volume,
    }));
  }, [historicalPriceData, dataType]);

  const changeColor = useMemo(() => {
    return getChangeColor(asset.priceChange24h?.toDec() || new Dec(0));
  }, [asset.priceChange24h]);

  return (
    <View>
      {/* // TODO: Add skeleton */}
      {isHistoricalPriceDataLoading ? (
        <ActivityIndicator />
      ) : (
        <LineGraph
          animated
          color={changeColor}
          points={points}
          enablePanGesture
          style={{
            alignSelf: "center",
            width: "100%",
            aspectRatio: 2,
          }}
          gradientFillColors={[
            transparentize(0.75, changeColor),
            transparentize(0.7, changeColor),
            transparentize(0.8, Colors.osmoverse[1000]),
            Colors.osmoverse[1000],
          ]}
          lineThickness={2.5}
          onGestureStart={() => {
            if (process.env.EXPO_OS === "ios") {
              // Add a soft haptic feedback when pressing down.
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onPointSelected={(point) => {
            setSelectedPoint(point);
          }}
          onGestureEnd={() => {
            setSelectedPoint(null);
          }}
        />
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

const styles = StyleSheet.create({
  timeFrameButtons: {
    marginTop: 20,
    flexDirection: "row",
    gap: 4,
  },
  timeFrameButton: { flex: 1 },
});
