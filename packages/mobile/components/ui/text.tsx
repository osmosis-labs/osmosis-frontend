import { StyleSheet, Text as RNText, type TextProps } from "react-native";

import { useTheme } from "~/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "subtitle" | "caption";
};

export function Text({ style, type = "default", ...rest }: ThemedTextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      style={[
        { color: colors.text },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "caption" ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 16,
  },
});
