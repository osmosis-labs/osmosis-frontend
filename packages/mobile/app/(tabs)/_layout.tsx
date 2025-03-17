import { Tabs } from "expo-router";
import { transparentize } from "polished";
import React from "react";

import { HapticTab } from "~/components/haptic-tab";
import { PieIcon } from "~/components/icons/pie";
import { SearchListIcon } from "~/components/icons/search-list";
import { TrendIcon } from "~/components/icons/trend";
import { BlurTabBarBackground } from "~/components/ui/tab-bar-background";
import { Colors } from "~/constants/theme-colors";
import { useTheme } from "~/hooks/use-theme";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarInactiveTintColor: transparentize(0.55, Colors.osmoverse["100"]),
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignSelf: "center",
          flex: 0,
          marginHorizontal: 12,
        },
        tabBarButton: HapticTab,
        tabBarBackground: BlurTabBarBackground,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          position: "absolute",
          height: 100,
          paddingTop: 10,
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <PieIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          tabBarIcon: ({ color }) => (
            <TrendIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          tabBarIcon: ({ color }) => (
            <SearchListIcon width={28} height={28} fill={color} />
          ),
        }}
      />
    </Tabs>
  );
}
