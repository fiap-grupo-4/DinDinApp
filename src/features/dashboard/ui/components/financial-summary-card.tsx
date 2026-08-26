import { Button } from "@/src/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/shared/ui/card";
import { Icon } from "@/src/shared/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/src/shared/ui/tabs";
import { Text } from "@/src/shared/ui/text";
import { cn } from "@/src/lib/utils";
import type { FinancialSummary } from "@features/dashboard/models/dashboard-metrics";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { SectionHeading } from "./section-heading";

type FinancialSummaryPeriod = "day" | "month";

type FinancialSummaryCardProps = {
  title?: string;
  daily: FinancialSummary;
  monthly: FinancialSummary;
  valuesVisible: boolean;
  onAddTransaction?: () => void;
};

const DESCRIPTIONS: Record<FinancialSummaryPeriod, string> = {
  day: "Veja um resumo de suas transações de hoje.",
  month: "Veja um resumo de suas transações do mês atual.",
};

const HIDDEN_VALUE = "R$ *****";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FinancialSummaryCard({
  title = "Resumo Financeiro",
  daily,
  monthly,
  valuesVisible,
  onAddTransaction,
}: FinancialSummaryCardProps) {
  const router = useRouter();
  const [period, setPeriod] = React.useState<FinancialSummaryPeriod>("day");
  const summary = period === "day" ? daily : monthly;

  const handleAddTransaction = () => {
    if (onAddTransaction) {
      onAddTransaction();
      return;
    }
    router.push("/transactions");
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <SectionHeading title={title} />
        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as FinancialSummaryPeriod)}
        >
          <TabsList className="bg-muted">
            <TabsTrigger
              value="day"
              className={cn(period === "day" && "bg-brand-500")}
            >
              <Text
                className={cn(
                  "font-medium",
                  period === "day" ? "text-white" : "text-muted-foreground",
                )}
              >
                Dia
              </Text>
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className={cn(period === "month" && "bg-brand-500")}
            >
              <Text
                className={cn(
                  "font-medium",
                  period === "month" ? "text-white" : "text-muted-foreground",
                )}
              >
                Mês
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="gap-4">
        <CardDescription>{DESCRIPTIONS[period]}</CardDescription>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1 rounded-lg bg-muted p-3">
            <Text variant="muted" className="text-sm">
              Entrada
            </Text>
            <Text className="text-base font-semibold text-brand-500">
              {valuesVisible
                ? `+ ${formatCurrency(summary.income)}`
                : HIDDEN_VALUE}
            </Text>
          </View>
          <View className="flex-1 gap-1 rounded-lg bg-muted p-3">
            <Text variant="muted" className="text-sm">
              Saída
            </Text>
            <Text className="text-base font-semibold text-danger-400">
              {valuesVisible
                ? `- ${formatCurrency(summary.expense)}`
                : HIDDEN_VALUE}
            </Text>
          </View>
        </View>

        <Button
          onPress={handleAddTransaction}
          className="bg-brand-600 active:bg-brand-700"
        >
          <Icon as={Plus} size={16} />
          <Text>Nova transação</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
