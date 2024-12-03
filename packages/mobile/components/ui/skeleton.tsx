import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "~/constants/theme-colors";

interface SkeletonProps extends ViewProps {
  className?: string;
  isLoaded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ style, isLoaded, ...props }) => {
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

  if (isLoaded) {
    return <View style={style} {...props} />;
  }

  return (
    <Animated.View style={[styles.skeleton, animatedStyle, style]} {...props}>
      <View style={[styles.invisible, { opacity: 0 }]}>{props.children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 4,
  },
  invisible: {
    opacity: 0,
  },
});

export { Skeleton };
