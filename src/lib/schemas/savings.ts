import { parseCurrencyInput } from "@/src/lib/currency";
import { z } from "zod";

const MONEY_PATTERN = /^\d+(\.\d{3})*(,\d{1,2})?$/;

const moneyFieldSchema = z
  .string()
  .trim()
  .min(1, "Valor é obrigatório.")
  .regex(MONEY_PATTERN, "Informe um valor válido, ex: 150,00.");

export const savingsGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'O campo "Título" é obrigatório.')
      .min(3, 'O campo "Título" deve ter no mínimo 3 caracteres.'),
    currentValue: moneyFieldSchema,
    targetValue: moneyFieldSchema,
  })
  .refine((data) => parseCurrencyInput(data.targetValue) > 0, {
    message: "A meta deve ser maior que zero.",
    path: ["targetValue"],
  })
  .refine(
    (data) =>
      parseCurrencyInput(data.currentValue) <=
      parseCurrencyInput(data.targetValue),
    {
      message: "O valor atual não pode ser maior que a meta.",
      path: ["currentValue"],
    },
  );

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;
