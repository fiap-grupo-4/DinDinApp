import { Card, CardContent, CardHeader } from "@/src/shared/ui/card";
import { Text } from "@/src/shared/ui/text";
import type { ExpenseCategory } from "@features/dashboard/models/dashboard-metrics";
import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SectionHeading } from "./section-heading";

type ExpensesBreakdownCardProps = {
  title?: string;
  data: ExpenseCategory[];
};

export function ExpensesBreakdownCard({
  title = "Principais gastos",
  data,
}: ExpensesBreakdownCardProps) {
  const totalSpent = data.reduce((sum, category) => sum + category.total, 0);

  const pieData = data.map((category) => ({
    value: category.total,
    color: category.color,
  }));

  return (
    <Card>
      <CardHeader>
        <SectionHeading title={title} />
      </CardHeader>
      <CardContent className="items-center gap-4">
        {data.length === 0 ? (
          <Text variant="muted" className="py-4 text-center text-sm">
            Nenhuma saída registrada neste mês.
          </Text>
        ) : (
          <PieChart
            data={pieData}
            donut
            radius={64}
            innerRadius={40}
            innerCircleColor="white"
          />
        )}
        <View className="w-full flex-row flex-wrap gap-x-4 gap-y-2.5">
          {data.map((category) => {
            const percentage = totalSpent
              ? Math.round((category.total / totalSpent) * 100)
              : 0;

            return (
              <View
                key={category.id}
                className="min-w-[45%] flex-1 flex-row items-center gap-2"
              >
                <View
                  className="size-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <Text
                  variant="muted"
                  className="flex-1 text-xs"
                  numberOfLines={1}
                >
                  {category.label}
                </Text>
                <Text className="text-xs font-semibold">{percentage}%</Text>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}
