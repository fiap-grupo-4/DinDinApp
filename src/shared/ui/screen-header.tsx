import { cn } from "@/src/lib/utils";
import { Text } from "@/src/shared/ui/text";
import { View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function ScreenHeader({ title, subtitle, className }: ScreenHeaderProps) {
  return (
    <View className={cn("gap-2", className)}>
      <Text variant="h3" className="text-left">
        {title}
      </Text>
      {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
    </View>
  );
}

export default ScreenHeader;
