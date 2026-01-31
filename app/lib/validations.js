import { z } from 'zod';

// Schema para validar segmento de clientes
export const ClientesFilterSchema = z.object({
  segmento: z.enum(['VIP', 'Regular', 'Activo', 'Nuevo']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20')
});

// Schema para validar filtros de productos
export const ProductosFilterSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10')
});

// Función helper para validar
export function validateClientesFilter(params) {
  const result = ClientesFilterSchema.safeParse(params);
  if (!result.success) {
    return { segmento: undefined, page: 1, limit: 20 };
  }
  return result.data;
}

export function validateProductosFilter(params) {
  const result = ProductosFilterSchema.safeParse(params);
  if (!result.success) {
    return { page: 1, limit: 10 };
  }
  return result.data;
}
