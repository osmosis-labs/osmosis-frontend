import React from "react";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const ChevronRightIcon = ({
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
      d="M14.3923 11.9207L7.3589 4.8872C7.1196 4.64795 7.004 4.36884 7.012 4.04986C7.0199 3.73088 7.1435 3.45177 7.3828 3.21254C7.622 2.97331 7.9011 2.85375 8.2201 2.85375C8.5391 2.85375 8.8182 2.97331 9.0574 3.21254L16.4258 10.557C16.6172 10.7484 16.7608 10.9637 16.8565 11.203C16.9522 11.4422 17 11.6814 17 11.9207C17 12.1599 16.9522 12.3991 16.8565 12.6384C16.7608 12.8776 16.6172 13.0929 16.4258 13.2843L9.0574 20.6527C8.8182 20.892 8.5351 21.0076 8.2081 20.9996C7.8812 20.9916 7.5981 20.868 7.3589 20.6288C7.1196 20.3896 7 20.1105 7 19.7915C7 19.4725 7.1196 19.1934 7.3589 18.9542L14.3923 11.9207Z"
      fill={fill}
    />
  </Svg>
);
