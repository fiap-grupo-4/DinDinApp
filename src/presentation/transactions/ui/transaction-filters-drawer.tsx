import { cn } from "@/src/lib/utils";
import { Button } from "@/src/shared/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/ui/drawer";
import { IconInput } from "@/src/shared/ui/icon-input";
import { Label } from "@/src/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/ui/select";
import { Text } from "@/src/shared/ui/text";
import { Category } from "@domain/categories/entities/Category";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";

export type TransactionFiltersValue = {
  search: string;
  transactionType?: "income" | "outcome";
  categoryId?: string;
  date?: string;
};

const TYPE_OPTIONS = [
  { value: "income", label: "Entrada" },
  { value: "outcome", label: "Saída" },
];

type TransactionFiltersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  value: TransactionFiltersValue;
  onApply: (value: TransactionFiltersValue) => void;
};

export function TransactionFiltersDrawer({
  open,
  onOpenChange,
  categories,
  value,
  onApply,
}: TransactionFiltersDrawerProps) {
  const [draft, setDraft] = useState<TransactionFiltersValue>(value);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const selectedType = TYPE_OPTIONS.find(
    (option) => option.value === draft.transactionType,
  );
  const selectedCategory = categories.find(
    (category) => category.uid === draft.categoryId,
  );

  function handleClear() {
    const cleared: TransactionFiltersValue = { search: "" };
    setDraft(cleared);
    onApply(cleared);
    onOpenChange(false);
  }

  function handleApply() {
    onApply(draft);
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtrar transações</DrawerTitle>
          <DrawerDescription>
            Combine busca, tipo e data para encontrar transações específicas.
          </DrawerDescription>
        </DrawerHeader>

        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="filter-search">Busca</Label>
            <IconInput
              icon={Search}
              nativeID="filter-search"
              value={draft.search}
              onChangeText={(text) =>
                setDraft((current) => ({ ...current, search: text }))
              }
              placeholder="Buscar transações..."
              returnKeyType="search"
            />
          </View>

          <View className="gap-2">
            <Label>Tipo</Label>
            <Select
              value={selectedType}
              onValueChange={(option) =>
                setDraft((current) => ({
                  ...current,
                  transactionType: option?.value as
                    | "income"
                    | "outcome"
                    | undefined,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as transações" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label>Categoria</Label>
            <Select
              value={
                selectedCategory
                  ? {
                      value: selectedCategory.uid,
                      label: selectedCategory.name,
                    }
                  : undefined
              }
              onValueChange={(option) =>
                setDraft((current) => ({
                  ...current,
                  categoryId: option?.value,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.uid}
                    value={category.uid}
                    label={category.name}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          <View className="gap-2">
            <Label nativeID="filter-date">Data</Label>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <IconInput
                  icon={Calendar}
                  nativeID="filter-date"
                  value={
                    draft.date
                      ? new Date(draft.date).toLocaleDateString("pt-BR")
                      : ""
                  }
                  placeholder="Selecione uma data"
                  editable={false}
                />
              </View>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={draft.date ? new Date(draft.date) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (event.type === "set" && selectedDate) {
                    setDraft((current) => ({
                      ...current,
                      date: selectedDate.toISOString(),
                    }));
                  }
                }}
              />
            )}
            {draft.date && (
              <Button
                variant="link"
                size="sm"
                className="self-start px-0"
                onPress={() =>
                  setDraft((current) => ({ ...current, date: undefined }))
                }
              >
                <Text className={cn("text-sm")}>Remover data</Text>
              </Button>
            )}
          </View>
        </View>

        <DrawerFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={handleClear}>
            <Text>Limpar</Text>
          </Button>
          <Button
            className="flex-1 bg-brand-600 active:bg-brand-700"
            onPress={handleApply}
          >
            <Text>Filtrar</Text>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default TransactionFiltersDrawer;
