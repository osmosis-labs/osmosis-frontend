import React from "react";
import Svg, { Path } from "react-native-svg";

export const AlertTriangle = ({
  width = 20,
  height = 20,
  color = "#ffffff",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      color={color}
      fill="none"
    >
      <Path
        d="M8.5749 3.21672L1.51656 15C1.37104 15.2521 1.29403 15.5378 1.29322 15.8288C1.2924 16.1198 1.3678 16.406 1.51192 16.6588C1.65603 16.9116 1.86383 17.1223 2.11465 17.2699C2.36547 17.4175 2.65056 17.4969 2.94156 17.5H17.0582C17.3492 17.4969 17.6343 17.4175 17.8851 17.2699C18.136 17.1223 18.3438 16.9116 18.4879 16.6588C18.632 16.406 18.7074 16.1198 18.7066 15.8288C18.7058 15.5378 18.6288 15.2521 18.4832 15L11.4249 3.21672C11.2763 2.9718 11.0672 2.76931 10.8176 2.62879C10.568 2.48826 10.2863 2.41443 9.9999 2.41443C9.71345 2.41443 9.43184 2.48826 9.18223 2.62879C8.93263 2.76931 8.72345 2.9718 8.5749 3.21672V3.21672Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 7.5V10.8333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 14.1666H10.0083"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
