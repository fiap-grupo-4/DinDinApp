import { formatCurrency } from "@/src/lib/currency";
import { Badge } from "@/src/shared/ui/badge";
import { Button } from "@/src/shared/ui/button";
import { Icon } from "@/src/shared/ui/icon";
import { Text } from "@/src/shared/ui/text";
import { Category } from "@domain/categories/entities/Category";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { Pencil, Trash2 } from "lucide-react-native";
import { View } from "react-native";

export type TransactionWithCategory = Transaction & { category?: Category };

type TransactionListItemProps = {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (transaction: TransactionWithCategory) => void;
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function TransactionListItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  const isIncome = transaction.transactionType === "income";
  const title = transaction.description || "Transação";

  return (
    <View className="bg-muted/40 flex-row items-center justify-between gap-3 rounded-xl px-4 py-3">
      <View className="flex-1 gap-1">
        <Text className="text-sm font-medium">{title}</Text>
        <View className="flex-row items-center gap-2">
          <Text
            className={
              isIncome
                ? "text-brand-500 text-sm font-semibold"
                : "text-danger-500 text-sm font-semibold"
            }
          >
            {isIncome ? "+ " : "- "}
            {formatCurrency(transaction.valueInCents)}
          </Text>
          {transaction.category && (
            <Badge variant="outline">
              <Text className="text-xs">{transaction.category.name}</Text>
            </Badge>
          )}
        </View>
      </View>

      <View className="items-end gap-1">
        <Text variant="muted" className="text-xs">
          {formatDate(transaction.createdAt)}
        </Text>
        <View className="-mr-2.5 flex-row items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full active:bg-brand-100"
            accessibilityLabel={`Editar ${title}`}
            onPress={() => onEdit(transaction)}
          >
            <Icon as={Pencil} size={16} className="text-brand-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full active:bg-danger-100"
            accessibilityLabel={`Excluir ${title}`}
            onPress={() => onDelete(transaction)}
          >
            <Icon as={Trash2} size={16} className="text-danger-400" />
          </Button>
        </View>
      </View>
    </View>
  );
}

export default TransactionListItem;
