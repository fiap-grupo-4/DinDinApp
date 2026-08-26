import { Card, CardContent, CardHeader } from "@/src/shared/ui/card";
import { Text } from "@/src/shared/ui/text";
import type { BalancePoint } from "@features/dashboard/models/dashboard-metrics";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SectionHeading } from "./section-heading";

type BalanceTrendCardProps = {
  title?: string;
  data: BalancePoint[];
};

export function BalanceTrendCard({
  title = "Acompanhamento de Saldo",
  data,
}: BalanceTrendCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <SectionHeading title={title} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Text variant="muted" className="py-4 text-center text-sm">
            Nenhuma movimentação para exibir.
          </Text>
        ) : (
          <>
            <View className="flex-row items-center justify-end gap-1.5 pb-2">
              <View className="h-0.5 w-3 rounded-full bg-brand-300" />
              <Text variant="muted" className="text-xs">
                Saldo
              </Text>
            </View>
            <LineChart
              data={data.map((point) => ({
                value: point.value,
                label: point.label,
              }))}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
