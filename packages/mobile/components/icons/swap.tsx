import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const SwapIcon = ({
  width = 24,
  height = 24,
  stroke = Colors.osmoverse[200],
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
    viewBox="0 0 19 24"
    fill="none"
    style={style}
  >
    <Path
      d="M6.125 1.93748L6.125 19.375L1.625 15.325"
      stroke={stroke}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M12.875 21.6249L12.875 4.18741L17.375 8.23741"
      stroke={stroke}
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);
