import React from "react";
import { StyleSheet, ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps extends ViewProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ style, ...props }) => {
  const opacity = useSharedValue(0.5);

  opacity.value = withRepeat(
    withTiming(1, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    }),
    -1,
    true
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.skeleton, animatedStyle, style]} {...props} />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#1F2937", // Equivalent to bg-osmoverse-700
    borderRadius: 4, // Equivalent to rounded-md
  },
});

export { Skeleton };
