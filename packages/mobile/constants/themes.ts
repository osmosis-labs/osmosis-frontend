import {
  DarkTheme as DefaultNavigationTheme,
  Theme,
} from "@react-navigation/native";

import { Colors } from "~/constants/colors";

const createTheme = <T extends Theme>(theme: T) => theme;

export const DefaultTheme = createTheme({
  ...DefaultNavigationTheme,
  colors: {
    ...DefaultNavigationTheme.colors,
    text: Colors.text,
    background: Colors.background,
    tabBarBackground: "hsla(248, 77%, 8%, 0.2)",
  },
});

export type AppTheme = typeof DefaultTheme;
