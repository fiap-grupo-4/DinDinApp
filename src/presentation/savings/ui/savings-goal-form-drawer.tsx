import {
  fromCents,
  maskCurrencyInput,
  parseCurrencyInput,
} from "@/src/lib/currency";
import {
  savingsGoalSchema,
  type SavingsGoalFormData,
} from "@/src/lib/schemas/savings";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/shared/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/ui/drawer";
import { IconInput } from "@/src/shared/ui/icon-input";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { zodResolver } from "@hookform/resolvers/zod";
import { PiggyBank, Target, Wallet } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

export type SavingsGoalSubmitData = {
  title: string;
  currentValueInCents: number;
  targetValueInCents: number;
};

type SavingsGoalFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoal | null;
  onSubmit: (data: SavingsGoalSubmitData) => Promise<void>;
};

function toFieldValue(valueInCents: number): string {
  return fromCents(valueInCents).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SavingsGoalFormDrawer({
  open,
  onOpenChange,
  goal,
  onSubmit,
}: SavingsGoalFormDrawerProps) {
  const isEditing = !!goal;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    mode: "onBlur",
    defaultValues: {
      title: goal?.title ?? "",
      currentValue: goal ? toFieldValue(goal.currentValueInCents) : "0,00",
      targetValue: goal ? toFieldValue(goal.targetValueInCents) : "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: goal?.title ?? "",
      currentValue: goal ? toFieldValue(goal.currentValueInCents) : "0,00",
      targetValue: goal ? toFieldValue(goal.targetValueInCents) : "",
    });
    setSubmitError(null);
  }, [open, goal, reset]);

  const handleFormSubmit = async (data: SavingsGoalFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: data.title,
        currentValueInCents: Math.round(
          parseCurrencyInput(data.currentValue) * 100,
        ),
        targetValueInCents: Math.round(
          parseCurrencyInput(data.targetValue) * 100,
        ),
      });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar sua economia.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isEditing ? "Editar economia" : "Nova economia"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? "Atualize o valor atual guardado e a meta desta economia."
              : "Defina um título, quanto já guardou e a meta a alcançar."}
          </DrawerDescription>
        </DrawerHeader>

        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="savings-goal-title">Título</Label>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <IconInput
                  icon={PiggyBank}
                  nativeID="savings-goal-title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Viagem para o RJ"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  aria-invalid={!!errors.title}
                  className={cn(errors.title && "border-destructive")}
                />
              )}
            />
            {errors.title && (
              <Text className="text-destructive text-sm">
                {errors.title.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label nativeID="savings-goal-target-value">Meta</Label>
            <Controller
              control={control}
              name="targetValue"
              render={({ field: { onChange, onBlur, value } }) => (
                <IconInput
                  icon={Target}
                  nativeID="savings-goal-target-value"
                  value={value}
                  onChangeText={(text) => onChange(maskCurrencyInput(text))}
                  onBlur={onBlur}
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  aria-invalid={!!errors.targetValue}
                  className={cn(errors.targetValue && "border-destructive")}
                />
              )}
            />
            {errors.targetValue && (
              <Text className="text-destructive text-sm">
                {errors.targetValue.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label nativeID="savings-goal-current-value">
              Quanto você já guardou
            </Label>
            <Controller
              control={control}
              name="currentValue"
              render={({ field: { onChange, onBlur, value } }) => (
                <IconInput
                  icon={Wallet}
                  nativeID="savings-goal-current-value"
                  value={value}
                  onChangeText={(text) => onChange(maskCurrencyInput(text))}
                  onBlur={onBlur}
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  editable={!isSubmitting}
                  aria-invalid={!!errors.currentValue}
                  className={cn(errors.currentValue && "border-destructive")}
                />
              )}
            />
            {errors.currentValue && (
              <Text className="text-destructive text-sm">
                {errors.currentValue.message}
              </Text>
            )}
          </View>

          {submitError && (
            <Text className="text-destructive text-sm">{submitError}</Text>
          )}
        </View>

        <DrawerFooter>
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            className="bg-brand-600 active:bg-brand-700"
          >
            <Text>{isSubmitting ? "Salvando..." : "Salvar"}</Text>
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              <Text>Cancelar</Text>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default SavingsGoalFormDrawer;
