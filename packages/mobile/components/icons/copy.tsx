import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const CopyIcon = ({
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
    <Rect x={8} y={8} width={14} height={14} rx={2} ry={2} />
    <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);
