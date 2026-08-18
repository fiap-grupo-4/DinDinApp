import { cn } from "@/src/lib/utils";
import type { PropsWithChildren } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";

type KeyboardDismissScreenProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Screen wrapper that dismisses the keyboard on outside tap or scroll,
 * without blocking buttons or inputs.
 */
function KeyboardDismissScreen({
  children,
  className,
}: KeyboardDismissScreenProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className={cn("min-h-full", className)}
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          {children}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export { KeyboardDismissScreen };
