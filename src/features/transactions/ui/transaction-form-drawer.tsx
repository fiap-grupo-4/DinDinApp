import { maskCurrencyInput, parseCurrencyInput } from "@/src/lib/currency";
import {
  transactionFormSchema,
  type TransactionFormData,
} from "@/src/lib/schemas/transactions";
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
import { Icon } from "@/src/shared/ui/icon";
import { IconInput } from "@/src/shared/ui/icon-input";
import { ImageInput } from "@/src/shared/ui/image-input";
import { Label } from "@/src/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/ui/select";
import { Text } from "@/src/shared/ui/text";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useCategories } from "@features/categories/hooks/useCategories";
import { uploadTransactionReceipt } from "@features/transactions/infra/uploadTransactionReceipt";
import { Category } from "@domain/categories/entities/Category";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, Tag, Wallet } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

export type TransactionSubmitData = {
  description: string;
  transactionType: "income" | "outcome";
  categoryId: string;
  valueInCents: number;
  receipt?: string;
};

type TransactionFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSubmit: (data: TransactionSubmitData) => Promise<void>;
};

function toFieldValue(valueInCents: number): string {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TransactionFormDrawer({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: TransactionFormDrawerProps) {
  const isEditing = !!transaction;
  const { user } = useAuthState();
  const { categories } = useCategories(user?.uid ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receiptUri, setReceiptUri] = useState<string | undefined>(undefined);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    mode: "onBlur",
    defaultValues: {
      description: transaction?.description ?? "",
      transactionType: transaction?.transactionType ?? "outcome",
      categoryId: transaction?.categoryId ?? "",
      value: transaction ? toFieldValue(transaction.valueInCents) : "",
    },
  });

  const transactionType = watch("transactionType");
  const categoryId = watch("categoryId");
  const selectedCategory = categories.find((c) => c.uid === categoryId);

  useEffect(() => {
    if (!open) return;
    reset({
      description: transaction?.description ?? "",
      transactionType: transaction?.transactionType ?? "outcome",
      categoryId: transaction?.categoryId ?? "",
      value: transaction ? toFieldValue(transaction.valueInCents) : "",
    });
    setReceiptUri(transaction?.receipt);
    setSubmitError(null);
  }, [open, transaction, reset]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (!user) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let receipt = transaction?.receipt;
      if (receiptUri && receiptUri !== transaction?.receipt) {
        receipt = await uploadTransactionReceipt(user.uid, receiptUri);
      } else if (!receiptUri) {
        receipt = undefined;
      }

      await onSubmit({
        description: data.description,
        transactionType: data.transactionType,
        categoryId: data.categoryId,
        valueInCents: Math.round(parseCurrencyInput(data.value) * 100),
        receipt,
      });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a transação.",
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
            {isEditing ? "Editar transação" : "Nova transação"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? "Atualize as informações desta transação."
              : "Preencha os dados para registrar uma nova transação."}
          </DrawerDescription>
        </DrawerHeader>

        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="transaction-description">Nome</Label>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <IconInput
                  icon={Tag}
                  nativeID="transaction-description"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Mercado"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  aria-invalid={!!errors.description}
                  className={cn(errors.description && "border-destructive")}
                />
              )}
            />
            {errors.description && (
              <Text className="text-destructive text-sm">
                {errors.description.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label>Tipo</Label>
            <View className="flex-row gap-2">
              <Button
                variant={transactionType === "income" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  transactionType === "income" &&
                    "bg-brand-600 active:bg-brand-700",
                )}
                disabled={isSubmitting}
                onPress={() => setValue("transactionType", "income")}
              >
                <Icon
                  as={ArrowUpCircle}
                  size={16}
                  className={transactionType === "income" ? "text-white" : undefined}
                />
                <Text>Entrada</Text>
              </Button>
              <Button
                variant={transactionType === "outcome" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  transactionType === "outcome" &&
                    "bg-danger-500 active:bg-danger-600",
                )}
                disabled={isSubmitting}
                onPress={() => setValue("transactionType", "outcome")}
              >
                <Icon
                  as={ArrowDownCircle}
                  size={16}
                  className={transactionType === "outcome" ? "text-white" : undefined}
                />
                <Text>Saída</Text>
              </Button>
            </View>
            {errors.transactionType && (
              <Text className="text-destructive text-sm">
                {errors.transactionType.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label nativeID="transaction-value">Valor</Label>
            <Controller
              control={control}
              name="value"
              render={({ field: { onChange, onBlur, value } }) => (
                <IconInput
                  icon={Wallet}
                  nativeID="transaction-value"
                  value={value}
                  onChangeText={(text) => onChange(maskCurrencyInput(text))}
                  onBlur={onBlur}
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  aria-invalid={!!errors.value}
                  className={cn(errors.value && "border-destructive")}
                />
              )}
            />
            {errors.value && (
              <Text className="text-destructive text-sm">
                {errors.value.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label>Categoria</Label>
            <Select
              value={
                selectedCategory
                  ? { value: selectedCategory.uid, label: selectedCategory.name }
                  : undefined
              }
              onValueChange={(option) =>
                setValue("categoryId", option?.value ?? "", {
                  shouldValidate: true,
                })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  errors.categoryId && "border-destructive",
                )}
              >
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: Category) => (
                  <SelectItem
                    key={category.uid}
                    value={category.uid}
                    label={category.name}
                  />
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <Text className="text-destructive text-sm">
                {errors.categoryId.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label>Comprovante</Label>
            <ImageInput
              value={receiptUri}
              onChange={setReceiptUri}
              disabled={isSubmitting}
            />
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

export default TransactionFormDrawer;
