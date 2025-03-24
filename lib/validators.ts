import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places'
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(3, 'Category must be at least 3 characters'),
  brand: z.string().min(3, 'Brand must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for signing users in
export const singInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

// Schema for signing users up
export const signUpFromSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z
      .string()
      .min(4, 'Confirm password must be at least 4 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
