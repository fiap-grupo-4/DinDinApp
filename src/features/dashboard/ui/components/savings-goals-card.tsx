import { formatCurrency } from "@/src/lib/currency";
import { Button } from "@/src/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/src/shared/ui/card";
import { Icon } from "@/src/shared/ui/icon";
import { Progress } from "@/src/shared/ui/progress";
import { Separator } from "@/src/shared/ui/separator";
import { Text } from "@/src/shared/ui/text";
import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { PiggyBank, Pencil, Plus, Trash2 } from "lucide-react-native";
import { Alert, View } from "react-native";
import { SectionHeading } from "./section-heading";

type SavingsGoalsCardProps = {
  title?: string;
  goals: SavingsGoal[];
  onAdd?: () => void;
  onEdit?: (goal: SavingsGoal) => void;
  onDelete?: (goal: SavingsGoal) => void;
};

export function SavingsGoalsCard({
  title = "Minhas economias",
  goals,
  onAdd,
  onEdit,
  onDelete,
}: SavingsGoalsCardProps) {
  function handleDelete(goal: SavingsGoal) {
    Alert.alert(
      "Excluir economia",
      `Tem certeza que deseja excluir "${goal.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => onDelete?.(goal),
        },
      ],
    );
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading title={title} />
      </CardHeader>
      <CardContent className="gap-4">
        {goals.length === 0 ? (
          <View className="items-center gap-2 py-4">
            <Icon as={PiggyBank} size={28} className="text-muted-foreground" />
            <Text variant="muted" className="text-center text-sm">
              Você ainda não tem economias cadastradas.
            </Text>
          </View>
        ) : (
          goals.map((goal, index) => {
            const percentage = goal.targetValueInCents
              ? Math.min(
                  100,
                  (goal.currentValueInCents / goal.targetValueInCents) * 100,
                )
              : 0;

            return (
              <View key={goal.uid}>
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium">{goal.title}</Text>
                    <View className="-mr-2.5 flex-row items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full active:bg-brand-100"
                        accessibilityLabel={`Editar ${goal.title}`}
                        onPress={() => onEdit?.(goal)}
                      >
                        <Icon
                          as={Pencil}
                          size={16}
                          className="text-brand-500"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full active:bg-danger-100"
                        accessibilityLabel={`Excluir ${goal.title}`}
                        onPress={() => handleDelete(goal)}
                      >
                        <Icon
                          as={Trash2}
                          size={16}
                          className="text-danger-400"
                        />
                      </Button>
                    </View>
                  </View>
                  <Progress
                    value={percentage}
                    className="bg-muted"
                    indicatorClassName="bg-brand-500"
                  />
                  <View className="flex-row items-center justify-between">
                    <Text variant="muted" className="text-xs">
                      {formatCurrency(goal.currentValueInCents)}
                    </Text>
                    <Text variant="muted" className="text-xs">
                      {formatCurrency(goal.targetValueInCents)}
                    </Text>
                  </View>
                </View>
                {index < goals.length - 1 ? <Separator className="mt-4" /> : null}
              </View>
            );
          })
        )}

        <Button
          onPress={onAdd}
          className="mt-1 bg-brand-600 active:bg-brand-700"
        >
          <Text>Adicionar economia</Text>
          <Icon as={Plus} size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}
