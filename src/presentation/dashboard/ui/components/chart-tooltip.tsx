import { formatCurrency } from "@/src/lib/currency";
import { Text } from "@/src/shared/ui/text";
import { View } from "react-native";

type ChartTooltipProps = {
  label: string;
  value: number;
  color?: string;
};

export function ChartTooltip({ label, value, color }: ChartTooltipProps) {
  return (
    <View className="min-w-32 rounded-lg bg-slate-900 px-3 py-2 shadow-sm">
      <View className="flex-row items-center gap-1.5">
        {color ? (
          <View
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <Text className="text-xs text-slate-300" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text className="mt-0.5 text-sm font-semibold text-white">
        {formatCurrency(Math.round(value * 100))}
      </Text>
    </View>
  );
}
