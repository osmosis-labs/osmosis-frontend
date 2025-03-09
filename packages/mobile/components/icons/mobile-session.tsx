import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const MobileSessionIcon = ({
  width = 24,
  height = 24,
  stroke = Colors.osmoverse[100],
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
    style={style}
  >
    <Path
      d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 19v-3.96 3.15"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 19h5"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      width="6"
      height="10"
      x="16"
      y="12"
      rx="2"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
