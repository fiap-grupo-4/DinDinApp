import { Card, CardContent, CardHeader } from "@/src/shared/ui/card";
import { Icon } from "@/src/shared/ui/icon";
import { Text } from "@/src/shared/ui/text";
import { ChevronDown } from "lucide-react-native";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SectionHeading } from "./section-heading";

export type BalancePoint = {
  label: string;
  value: number;
};

type BalanceTrendCardProps = {
  title?: string;
  period?: string;
  data: BalancePoint[];
};

export function BalanceTrendCard({
  title = "Acompanhamento de Saldo",
  period = "Mensal",
  data,
}: BalanceTrendCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <SectionHeading title={title} />
        <View className="flex-row items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5">
          <Text className="text-xs">{period}</Text>
          <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-center justify-end gap-1.5 pb-2">
          <View className="h-0.5 w-3 rounded-full bg-brand-300" />
          <Text variant="muted" className="text-xs">
            Saldo
          </Text>
        </View>
        <LineChart
          data={data.map((point) => ({ value: point.value, label: point.label }))}
          areaChart
          curved
          color="#2FD89F"
          thickness={2}
          startFillColor="#2FD89F"
          endFillColor="#2FD89F"
          startOpacity={0.3}
          endOpacity={0.02}
          dataPointsColor="#2FD89F"
          dataPointsRadius={3}
          yAxisTextStyle={{ fontSize: 10, color: "#888888" }}
          xAxisLabelTextStyle={{ fontSize: 10, color: "#888888" }}
          xAxisColor="#ededed"
          yAxisColor="#ededed"
          rulesColor="#ededed"
          rulesType="solid"
          noOfSections={4}
          initialSpacing={8}
          endSpacing={8}
          spacing={38}
          adjustToWidth
          hideDataPoints={false}
        />
      </CardContent>
    </Card>
  );
}
