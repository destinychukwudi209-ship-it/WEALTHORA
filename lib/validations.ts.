import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(10).max(128) });
export const promoSchema = z.object({ code: z.string().trim().min(3).max(32).regex(/^[A-Z0-9-]+$/i) });
export const amountSchema = z.number().positive().max(10_000_000).finite();
