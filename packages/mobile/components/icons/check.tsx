import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const CheckIcon = ({
  width = 16,
  height = 16,
  stroke = Colors.osmoverse[500],
  style,
}: {
  width?: number;
  height?: number;
  stroke?: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);
