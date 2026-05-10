import React, { useEffect } from "react";
import { ViewStyle, StyleProp, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Skeleton({ style, className }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className={className} style={style}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.skeleton, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
});
