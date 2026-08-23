import { Logo } from "@/src/shared/ui/logo";
import { Text } from "@/src/shared/ui/text";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="items-center gap-10 bg-brand-600 px-6 pb-14"
      style={{ paddingTop: insets.top + 20 }}
    >
      <Logo height={32} />
      <View className="items-center gap-2">
        <Text className="text-2xl font-semibold text-brand-100">{title}</Text>
        <Text className="max-w-[280px] text-center text-sm text-brand-200">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export { AuthHeader };
