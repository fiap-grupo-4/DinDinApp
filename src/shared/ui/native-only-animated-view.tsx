import React, { type ComponentProps } from "react";
import { Platform, Pressable } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NativeOnlyAnimatedViewProps =
  | (ComponentProps<typeof Animated.View> & { as?: "View" })
  | (ComponentProps<typeof AnimatedPressable> & { as: "Pressable" });

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
function NativeOnlyAnimatedView(props: NativeOnlyAnimatedViewProps) {
  if (Platform.OS === "web") {
    return <>{props.children as React.ReactNode}</>;
  }

  if (props.as === "Pressable") {
    return <AnimatedPressable {...(props as any)} />;
  }

  return <Animated.View {...(props as any)} />;
}

export { NativeOnlyAnimatedView };
