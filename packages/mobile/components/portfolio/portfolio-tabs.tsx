import React, { FunctionComponent, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Allocation } from "~/components/portfolio/allocation";
import { PortfolioActivity } from "~/components/portfolio/portfolio-activity";
import { PortfolioAssetBalancesTable } from "~/components/portfolio/portfolio-asset-balances-table";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { RouterOutputs } from "~/utils/trpc";

type PortfolioTab = "assets" | "allocation" | "activity";

interface PortfolioTabsProps {
  allocation?: RouterOutputs["local"]["portfolio"]["getPortfolioAssets"];
  isLoadingAllocation: boolean;
}

export const PortfolioTabs: FunctionComponent<PortfolioTabsProps> = ({
  allocation,
  isLoadingAllocation,
}) => {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("assets");

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("assets")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "assets" ? styles.activeTabText : null,
            ]}
          >
            Balances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("allocation")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "allocation" ? styles.activeTabText : null,
            ]}
          >
            Allocation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("activity")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "activity" ? styles.activeTabText : null,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "assets" && <PortfolioAssetBalancesTable />}
        {activeTab === "allocation" && (
          <>
            {isLoadingAllocation ? (
              <ActivityIndicator
                color={Colors.wosmongton[500]}
                size="large"
                style={styles.loader}
              />
            ) : (
              allocation && <Allocation assets={allocation} />
            )}
          </>
        )}
        {activeTab === "activity" && <PortfolioActivity />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.osmoverse[1000],
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: "flex-start",
  },
  tab: {
    marginRight: 20,
  },
  tabText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.osmoverse[300],
  },
  activeTabText: {
    color: Colors.white.full,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.osmoverse[900],
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
    overflow: "hidden",
    paddingTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});
