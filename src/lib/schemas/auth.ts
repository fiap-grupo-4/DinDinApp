import { z } from "zod";

const PASSWORD_MIN_LENGTH = 6;

const passwordSchema = z
  .string()
  .min(1, 'O campo "Senha" é obrigatório.')
  .min(
    PASSWORD_MIN_LENGTH,
    `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(
    /[^A-Za-z0-9]/,
    "A senha deve conter pelo menos um caractere especial.",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'O campo "Nome" é obrigatório.')
      .min(3, 'O campo "Nome" deve ter no mínimo 3 caracteres'),
    email: z
      .string()
      .trim()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
