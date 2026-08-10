import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'O campo "Nome" é obrigatório.')
    .min(3, 'O campo "Nome" deve ter no mínimo 3 caracteres'),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(1, 'O campo "Senha" é obrigatório.')
    .min(6, 'O campo "Senha" deve ter no mínimo 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'O campo "Confirmação Senha" é obrigatório.')
    .min(6, 'O campo "Confirmação Senha" deve ter no mínimo 6 caracteres'),
  bank: z.string().min(1, 'O campo "Banco" é obrigatório.'),
  agency: z.string().min(1, 'O campo "Agencia" é obrigatório.'),
  account: z.string().min(1, 'O campo "Conta" é obrigatório.'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
