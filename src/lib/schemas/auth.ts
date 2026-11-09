import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

const passwordSchema = z
  .string()
  .min(1, 'O campo "Senha" é obrigatório.')
  .max(128, "A senha deve ter no máximo 128 caracteres.")
  .min(
    PASSWORD_MIN_LENGTH,
    `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .regex(/\d/, "A senha deve conter pelo menos um número.")
  .refine(
    (password) =>
      !["password123", "senha1234", "qwerty123", "12345678"].includes(
        password.toLowerCase(),
      ),
    "Escolha uma senha menos comum.",
  );

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "O e-mail deve ter no máximo 254 caracteres.")
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória.").max(128),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .max(100, 'O campo "Nome" deve ter no máximo 100 caracteres.')
      .min(1, 'O campo "Nome" é obrigatório.')
      .min(3, 'O campo "Nome" deve ter no mínimo 3 caracteres'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
