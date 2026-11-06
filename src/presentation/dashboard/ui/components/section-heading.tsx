import { CardTitle } from "@/src/shared/ui/card";
import { cn } from "@/src/lib/utils";
import { View } from "react-native";

type SectionHeadingProps = {
  title: string;
  className?: string;
};

export function SectionHeading({ title, className }: SectionHeadingProps) {
  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      <View className="size-2 rounded-[2px] bg-brand-400" />
      <CardTitle className="text-base">{title}</CardTitle>
    </View>
  );
}
