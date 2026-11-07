
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number")
    .regex(/[^A-Za-z0-9]/, "Include a special character"),
});

export const promoSchema = z.object({
  code: z.string().trim().min(3).max(32).regex(/^[A-Z0-9-]+$/i),
});

export const amountSchema = z
  .number()
  .positive()
  .max(10_000_000)
  .finite();

export const transactionSchema = z.object({
  amount: amountSchema,
  pin: z.string().regex(/^\d{4,6}$/),
});

export const withdrawalSchema = z.object({
  amount: amountSchema,
  accountNumber: z.string().regex(/^\d{10}$/),
  bankCode: z.string().min(2).max(20),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});
