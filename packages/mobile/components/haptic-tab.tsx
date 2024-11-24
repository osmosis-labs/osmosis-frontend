import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { Colors } from "~/constants/colors";
export function HapticTab(props: BottomTabBarButtonProps) {
  const isActive = props.accessibilityState?.selected === true;
  return (
    <PlatformPressable
      {...props}
      style={[
        {
          alignSelf: "center",
          paddingVertical: 12,
          paddingHorizontal: 28,
          borderRadius: 255,
        },
        isActive && {
          backgroundColor: Colors.wosmongton["500"],
          shadowColor: "#5B57FA",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
        },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
