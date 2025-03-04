import { Dec } from "@osmosis-labs/unit";
import React, { FunctionComponent, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AllocationTabs } from "~/components/portfolio/allocation-tabs";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { RouterOutputs } from "~/utils/trpc";

import { AllocationOptions } from "./types";

const COLORS: Record<AllocationOptions, string[]> = {
  all: [
    Colors.wosmongton[500],
    Colors.ammelia[400],
    Colors.osmoverse[500],
    Colors.bullish[500],
    Colors.ion[500],
  ],
  assets: [
    "#9C01D4",
    "#E9983D",
    "#2775CA",
    "#424667",
    "#009393",
    Colors.osmoverse[500],
  ],
  available: [
    "#9C01D4",
    "#E9983D",
    "#2775CA",
    "#424667",
    "#009393",
    Colors.osmoverse[500],
  ],
};

const getTranslation = (key: string): string => {
  const translationMap: Record<string, string> = {
    available: "Available",
    staked: "Staked",
    unstaking: "Unstaking",
    unclaimedRewards: "Unclaimed Rewards",
    pooled: "Pooled",
    other: "Other",
  };

  return translationMap[key] || key;
};

export const Allocation: FunctionComponent<{
  assets?: RouterOutputs["local"]["portfolio"]["getPortfolioAssets"];
}> = ({ assets }) => {
  const [selectedOption, setSelectedOption] =
    useState<AllocationOptions>("all");

  const selectedList = useMemo(
    () => assets?.[selectedOption] ?? [],
    [assets, selectedOption]
  );

  if (!assets) return null;

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <AllocationTabs setTab={setSelectedOption} activeTab={selectedOption} />
      </View>

      <View style={styles.barContainer}>
        {selectedList.map(({ key, percentage }, index) => {
          const color =
            COLORS[selectedOption][index % COLORS[selectedOption].length];
          const isNegligiblePercent = percentage.toDec().lt(new Dec(0.01));
          const width = isNegligiblePercent
            ? 1
            : parseFloat(percentage.toDec().toString()) * 100;

          return (
            <View
              key={key}
              style={[
                styles.barSegment,
                { backgroundColor: color, width: `${width}%` },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.legendContainer}>
        {selectedList.map(({ key, percentage, fiatValue }, index) => {
          const color =
            COLORS[selectedOption][index % COLORS[selectedOption].length];

          return (
            <View key={key} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View
                  style={[styles.colorIndicator, { backgroundColor: color }]}
                />
                <Text>{getTranslation(key)}</Text>
                <Text style={styles.percentageText}>
                  {percentage.maxDecimals(0).toString()}
                </Text>
              </View>
              <Text>{fiatValue.toString()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  barContainer: {
    height: 16,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  barSegment: {
    height: "100%",
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  percentageText: {
    color: Colors.osmoverse[400],
  },
});
