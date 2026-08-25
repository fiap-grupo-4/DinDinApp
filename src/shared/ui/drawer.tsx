import { Icon } from "@/src/shared/ui/icon";
import { useFullWindowOverlayVisible } from "@/src/shared/ui/full-window-overlay-visibility";
import { NativeOnlyAnimatedView } from "@/src/shared/ui/native-only-animated-view";
import { cn } from "@/src/lib/utils";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import {
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type ViewProps,
} from "react-native";
import {
  FadeIn,
  FadeOut,
  ReduceMotion,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

const Drawer = DialogPrimitive.Root;

const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerPortal = DialogPrimitive.Portal;

const DrawerClose = DialogPrimitive.Close;

function DrawerOverlay({
  className,
  children,
  onPress,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  children?: React.ReactNode;
}) {
  const { onOpenChange } = DialogPrimitive.useRootContext();
  const isOverlayVisible = useFullWindowOverlayVisible();

  const FullWindowOverlay =
    Platform.OS === "ios" && isOverlayVisible
      ? RNFullWindowOverlay
      : React.Fragment;

  function onOverlayPress(event: GestureResponderEvent) {
    onPress?.(event);
    if (event.target === event.currentTarget && !event.isDefaultPrevented()) {
      onOpenChange(false);
    }
  }

  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn(
          "absolute bottom-0 left-0 right-0 top-0 flex items-stretch justify-end bg-black/50",
          Platform.select({
            web: "animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto",
          }),
          className,
        )}
        {...props}
        onPress={Platform.select({ web: onOverlayPress, native: onPress })}
        asChild={Platform.OS !== "web"}
      >
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
          as="Pressable"
        >
          <>{children}</>
        </NativeOnlyAnimatedView>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
}

function DrawerContent({
  className,
  portalHost,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  const { height: windowHeight } = useWindowDimensions();

  return (
    <DrawerPortal hostName={portalHost}>
      <DrawerOverlay>
        <NativeOnlyAnimatedView
          entering={SlideInDown.duration(280).reduceMotion(
            ReduceMotion.System,
          )}
          exiting={SlideOutDown.duration(200).reduceMotion(
            ReduceMotion.System,
          )}
        >
          <DialogPrimitive.Content
            className={cn(
              "bg-background border-border z-50 mx-auto flex w-full max-w-lg flex-col rounded-t-2xl border-t shadow-lg shadow-black/10",
              Platform.select({
                web: "animate-in slide-in-from-bottom duration-300",
              }),
              className,
            )}
            style={[{ height: windowHeight * 0.8 }, style]}
            {...props}
          >
            <View className="bg-muted mb-1 mt-3 h-1.5 w-12 self-center rounded-full" />
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-4 px-6 pb-10 pt-2"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <>{children}</>
            </ScrollView>
            <DialogPrimitive.Close
              className={cn(
                "absolute right-4 top-4 rounded opacity-70 active:opacity-100",
                Platform.select({
                  web: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
                }),
              )}
              hitSlop={12}
            >
              <Icon
                as={X}
                className={cn(
                  "text-accent-foreground web:pointer-events-none size-4 shrink-0",
                )}
              />
              <Text className="sr-only">Close</Text>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </NativeOnlyAnimatedView>
      </DrawerOverlay>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: ViewProps) {
  return (
    <View className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
}

function DrawerFooter({ className, ...props }: ViewProps) {
  return (
    <View className={cn("flex flex-col gap-2 pt-2", className)} {...props} />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-foreground text-lg font-semibold leading-none",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
