import React, { forwardRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Colors } from "~/constants/theme-colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(
  (
    {
      title,
      onPress,
      variant = "primary",
      buttonStyle,
      textStyle,
      disabled,
      loading,
      icon,
    },
    ref
  ) => {
    let variantStyles = {};

    if (variant === "outline") {
      variantStyles = styles.outline;
    } else if (variant === "secondary") {
      variantStyles = styles.secondary;
    } else if (variant === "danger") {
      variantStyles = styles.danger;
    } else {
      variantStyles = styles.primary;
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.button,
          variantStyles,
          buttonStyle,
          (disabled || loading) && styles.disabled,
        ]}
        disabled={disabled || loading}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 255,
    alignItems: "center",
  },
  primary: {
    backgroundColor: Colors["wosmongton"][500],
  },
  secondary: {
    backgroundColor: Colors["osmoverse"][825],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors["osmoverse"][500],
  },
  danger: {
    backgroundColor: Colors["rust"][700],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
