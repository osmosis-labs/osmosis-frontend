import React from "react";
import Svg, { Path } from "react-native-svg";

import { Colors } from "~/constants/theme-colors";

export const PieIcon = ({
  width = 24,
  height = 24,
  fill = Colors.osmoverse[100],
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M19.8075 12.9068C19.9361 13.2845 19.9841 13.7071 19.925 14.1638C19.3529 18.5854 15.5767 22.0001 10.9998 22.0001C6.02919 22.0001 1.99976 17.9706 1.99976 13.0001C1.99976 8.42316 5.41441 4.64695 9.83603 4.07483C10.2927 4.01574 10.7153 4.06373 11.093 4.19229C11.422 2.93527 12.5931 1.87164 14.1635 2.07483C18.205 2.59777 21.4021 5.79478 21.925 9.83634C22.1282 11.4067 21.0645 12.5778 19.8075 12.9068ZM12.8179 13.0001C11.8138 13.0001 10.9998 12.186 10.9998 11.1819V6.90916C10.9998 6.40708 10.5906 5.99387 10.0927 6.0583C6.6552 6.50307 3.99976 9.44146 3.99976 13.0001C3.99976 16.8661 7.13376 20.0001 10.9998 20.0001C14.5584 20.0001 17.4967 17.3446 17.9415 13.9072C18.0059 13.4092 17.5927 13.0001 17.0907 13.0001H12.8179ZM19.0923 11.0001C19.5944 11.0001 20.0059 10.5909 19.9415 10.093C19.5352 6.95243 17.0474 4.46465 13.9068 4.0583C13.4089 3.99387 12.9998 4.40545 12.9998 4.90753V10.0903C12.9998 10.5924 13.4074 11.0001 13.9095 11.0001H19.0923Z"
      fill={fill}
    />
  </Svg>
);