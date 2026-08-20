import { Icon } from "@/src/shared/ui/icon";
import { Input } from "@/src/shared/ui/input";
import { cn } from "@/src/lib/utils";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type IconInputProps = React.ComponentProps<typeof Input> & {
  icon: LucideIcon;
};

function IconInput({ icon, className, ...props }: IconInputProps) {
  return (
    <View className="justify-center">
      <Input className={cn("pr-10", className)} {...props} />
      <Icon
        as={icon}
        size={18}
        className="absolute right-3 text-gray-500"
        pointerEvents="none"
      />
    </View>
  );
}

export { IconInput };
