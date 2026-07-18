import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileFormSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(150),
  title: z.string().max(150).optional().or(z.literal('')),
  company: z.string().max(150).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  phone: z.string().max(32).optional().or(z.literal('')),
  public_email: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Enter a valid email',
    }),
  website: z.string().max(255).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  linkedin: z.string().max(255).optional().or(z.literal('')),
  twitter: z.string().max(255).optional().or(z.literal('')),
  instagram: z.string().max(255).optional().or(z.literal('')),
  facebook: z.string().max(255).optional().or(z.literal('')),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const manualConnectionSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(150),
  title: z.string().max(150).optional().or(z.literal('')),
  company: z.string().max(150).optional().or(z.literal('')),
  email: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Enter a valid email',
    }),
  phone: z.string().max(32).optional().or(z.literal('')),
  website: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(4000).optional().or(z.literal('')),
});
export type ManualConnectionFormValues = z.infer<typeof manualConnectionSchema>;
