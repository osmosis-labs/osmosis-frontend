import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "~/components/haptic-tab";
import { PieIcon } from "~/components/icons/pie";
import { SearchListIcon } from "~/components/icons/search-list";
import { BlurTabBarBackground } from "~/components/ui/tab-bar-background";
import { Colors } from "~/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarBackground: BlurTabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
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
