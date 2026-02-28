import { z } from "zod";

export const ServiceLineSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  notes: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  product: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  status: z.enum(["In Stock", "Out of Stock", "Restocking"]),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  price: z.number().positive("Price must be positive"),
  cost: z.number().positive("Cost must be positive"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  sales: z.number().int().min(0, "Sales must be non-negative"),
  services: z.array(ServiceLineSchema).optional(),
});

export const StatusGroupSchema = z.object({
  id: z.string(),
  status: z.enum(["In Stock", "Out of Stock", "Restocking"]),
  children: z.array(ProductSchema),
});

export type ServiceLine = z.infer<typeof ServiceLineSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type StatusGroup = z.infer<typeof StatusGroupSchema>;
export type RowNode = StatusGroup | Product | ServiceLine;

export const isGroup = (r: RowNode): r is StatusGroup =>
  (r as StatusGroup).children !== undefined;
export const isProduct = (r: RowNode): r is Product =>
  (r as Product).sku !== undefined;
export const isService = (r: RowNode): r is ServiceLine =>
  (r as any).type !== undefined && (r as any).sku === undefined;
