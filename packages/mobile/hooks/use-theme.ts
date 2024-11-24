import { useTheme as useNavigationTheme } from "@react-navigation/native";

import { AppTheme } from "~/constants/themes";

export function useTheme() {
  const theme = useNavigationTheme();
  return theme as AppTheme;
}
