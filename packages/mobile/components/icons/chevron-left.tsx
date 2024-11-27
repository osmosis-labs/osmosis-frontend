import React from "react";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Colors } from "~/constants/colors";

export const ChevronLeftIcon = ({
  width = 16,
  height = 16,
  fill = Colors.osmoverse[500],
  style,
}: {
  width?: number;
  height?: number;
  fill?: string;
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
      d="M9.60766 12.0793L16.6411 19.1128C16.8804 19.3521 16.996 19.6312 16.988 19.9501C16.9801 20.2691 16.8565 20.5482 16.6172 20.7875C16.378 21.0267 16.0989 21.1463 15.7799 21.1463C15.4609 21.1463 15.1818 21.0267 14.9426 20.7875L7.57416 13.443C7.38278 13.2516 7.23923 13.0363 7.14354 12.797C7.04785 12.5578 7 12.3186 7 12.0793C7 11.8401 7.04785 11.6009 7.14354 11.3616C7.23923 11.1224 7.38278 10.9071 7.57416 10.7157L14.9426 3.34728C15.1818 3.10804 15.4649 2.99241 15.7919 3.00039C16.1188 3.00836 16.4019 3.13196 16.6411 3.3712C16.8804 3.61043 17 3.88954 17 4.20852C17 4.5275 16.8804 4.80661 16.6411 5.04584L9.60766 12.0793Z"
      fill={fill}
    />
  </Svg>
);
