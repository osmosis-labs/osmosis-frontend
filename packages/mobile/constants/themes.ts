import {
  DarkTheme as DefaultNavigationTheme,
  Theme,
} from "@react-navigation/native";

import { Colors } from "~/constants/colors";

export const DefaultTheme: Theme = {
  ...DefaultNavigationTheme,
  colors: {
    ...DefaultNavigationTheme.colors,
    background: Colors.background,
  },
};
