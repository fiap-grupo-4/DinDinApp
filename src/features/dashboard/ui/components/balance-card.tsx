import { Button } from "@/src/shared/ui/button";
import { Card, CardContent } from "@/src/shared/ui/card";
import { Icon } from "@/src/shared/ui/icon";
import { Text } from "@/src/shared/ui/text";
import { Eye, EyeOff } from "lucide-react-native";
import { View } from "react-native";

const HIDDEN_VALUE = "R$ *****";

type BalanceCardProps = {
  title?: string;
  balance: number;
  visible: boolean;
  onToggleVisible: () => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BalanceCard({
  title = "Saldo em conta",
  balance,
  visible,
  onToggleVisible,
}: BalanceCardProps) {
  return (
    <Card>
      <CardContent className="flex-row items-center justify-between gap-3">
        <View className="gap-1">
          <Text variant="muted" className="text-sm">
            {title}
          </Text>
          <Text className="text-2xl font-bold">
            {visible ? formatCurrency(balance) : HIDDEN_VALUE}
          </Text>
        </View>
        <Button variant="outline" onPress={onToggleVisible}>
          <Icon as={visible ? Eye : EyeOff} size={16} />
          <Text>{visible ? "Ocultar saldo" : "Mostrar saldo"}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
