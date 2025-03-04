import React, { FunctionComponent, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

import { AllocationOptions } from "./types";

interface AllocationTabsProps {
  setTab: (tab: AllocationOptions) => void;
  activeTab: AllocationOptions;
}

export const AllocationTabs: FunctionComponent<AllocationTabsProps> = ({
  setTab,
  activeTab,
}) => {
  const tabs = useMemo(
    () => [
      {
        label: "All",
        value: "all" as AllocationOptions,
      },
      {
        label: "Assets",
        value: "assets" as AllocationOptions,
      },
      {
        label: "Available",
        value: "available" as AllocationOptions,
      },
    ],
    []
  );

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <TouchableOpacity
            key={`allocation-tab-${tab.value}`}
            onPress={() => setTab(tab.value)}
            style={[styles.tab, isActive ? styles.activeTab : null]}
          >
            <Text
              style={[styles.tabText, isActive ? styles.activeTabText : null]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.osmoverse[700],
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: Colors.osmoverse[700],
  },
  tabText: {
    color: Colors.wosmongton[100],
  },
  activeTabText: {
    color: "white",
  },
});
