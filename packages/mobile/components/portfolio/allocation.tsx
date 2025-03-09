import { Dec } from "@osmosis-labs/unit";
import React, { FunctionComponent } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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

// Component to render a single allocation section
const AllocationSection: FunctionComponent<{
  title: string;
  allocationList: RouterOutputs["local"]["portfolio"]["getPortfolioAssets"][AllocationOptions];
  colors: string[];
}> = ({ title, allocationList, colors }) => {
  if (allocationList.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.barContainer}>
        {allocationList.map(({ key, percentage }, index) => {
          const color = colors[index % colors.length];
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
        {allocationList.map(({ key, percentage, fiatValue }, index) => {
          const color = colors[index % colors.length];

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

export const Allocation: FunctionComponent<{
  assets?: RouterOutputs["local"]["portfolio"]["getPortfolioAssets"];
}> = ({ assets }) => {
  if (!assets) return null;

  const sections = [
    { key: "all" as AllocationOptions, title: "All" },
    { key: "assets" as AllocationOptions, title: "Assets" },
    { key: "available" as AllocationOptions, title: "Available" },
  ];

  return (
    <ScrollView style={styles.container}>
      {sections.map((section) => (
        <AllocationSection
          key={section.key}
          title={section.title}
          allocationList={assets[section.key] ?? []}
          colors={COLORS[section.key]}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
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
