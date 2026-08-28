import { Button } from "@/src/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/src/shared/ui/card";
import { Icon } from "@/src/shared/ui/icon";
import { Separator } from "@/src/shared/ui/separator";
import { Text } from "@/src/shared/ui/text";
import type { RecentTransaction } from "@features/dashboard/models/dashboard-metrics";
import { ChevronRight, Pencil, Trash2 } from "lucide-react-native";
import { Alert, View } from "react-native";

type RecentTransactionsCardProps = {
  title?: string;
  transactions: RecentTransaction[];
  onSeeMore?: () => void;
  onEdit?: (transaction: RecentTransaction) => void;
  onDelete?: (transaction: RecentTransaction) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function RecentTransactionsCard({
  title = "Transações Recentes",
  transactions,
  onSeeMore,
  onEdit,
  onDelete,
}: RecentTransactionsCardProps) {
  function handleDelete(transaction: RecentTransaction) {
    Alert.alert(
      "Excluir transação",
      `Tem certeza que deseja excluir "${transaction.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDelete?.(transaction),
        },
      ],
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <View className="size-2 rounded-[2px] bg-brand-400" />
        <Text className="text-base font-semibold">{title}</Text>
      </CardHeader>
      <CardContent className="gap-3">
        {transactions.length === 0 ? (
          <Text variant="muted" className="py-4 text-center text-sm">
            Nenhuma transação cadastrada.
          </Text>
        ) : null}

        {transactions.map((transaction, index) => (
          <View key={transaction.id}>
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-1 gap-1 pr-2">
                <Text className="text-sm font-medium">
                  {transaction.title}
                </Text>
                <Text
                  className={
                    transaction.transactionType === "income"
                      ? "text-brand-500 text-sm font-semibold"
                      : "text-danger-500 text-sm font-semibold"
                  }
                >
                  {transaction.transactionType === "income" ? "+ " : "- "}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text variant="muted" className="text-xs">
                  {transaction.date}
                </Text>
                <View className="-mr-2.5 flex-row items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full active:bg-brand-100"
                    accessibilityLabel={`Editar ${transaction.title}`}
                    onPress={() => onEdit?.(transaction)}
                  >
                    <Icon as={Pencil} size={16} className="text-brand-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full active:bg-danger-100"
                    accessibilityLabel={`Excluir ${transaction.title}`}
                    onPress={() => handleDelete(transaction)}
                  >
                    <Icon as={Trash2} size={16} className="text-danger-400" />
                  </Button>
                </View>
              </View>
            </View>
            {index < transactions.length - 1 ? <Separator /> : null}
          </View>
        ))}

        <Button
          onPress={onSeeMore}
          className="mt-1 bg-brand-600 active:bg-brand-700"
        >
          <Text>Ver todas as transações</Text>
          <Icon as={ChevronRight} size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}
