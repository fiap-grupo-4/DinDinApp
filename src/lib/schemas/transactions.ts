import { parseCurrencyInput } from "@/src/lib/currency";
import { z } from "zod";

const MONEY_PATTERN = /^\d+(\.\d{3})*(,\d{1,2})?$/;

export const transactionFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'O campo "Nome" é obrigatório.'),
    transactionType: z.enum(["income", "outcome"], {
      message: "Selecione o tipo da transação.",
    }),
    categoryId: z.string().trim().min(1, "Selecione uma categoria."),
    value: z
      .string()
      .trim()
      .min(1, "Valor é obrigatório.")
      .regex(MONEY_PATTERN, "Informe um valor válido, ex: 150,00."),
    receiptUri: z.string().optional(),
  })
  .refine((data) => parseCurrencyInput(data.value) > 0, {
    message: "O valor deve ser maior que zero.",
    path: ["value"],
  });

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
