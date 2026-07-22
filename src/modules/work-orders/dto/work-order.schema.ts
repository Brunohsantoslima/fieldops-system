import { z } from 'zod';
import { Priority, OrderStatus } from '@prisma/client';

export const createWorkOrderSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'O título deve ter no mínimo 3 caracteres.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  
  description: z.string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .optional(),
  
  priority: z.nativeEnum(Priority, {
    message: 'Prioridade inválida.',
  }),
  
  teamId: z.string()
    .trim()
    .min(1, 'O ID/slug do time é obrigatório.'),
  
  // Mudado para opcional pensando no fluxo: Criação -> Atribuição posterior
  assigneeId: z.string()
    .uuid('O ID do responsável deve ser um UUID válido.')
    .optional(),
});

export type CreateWorkOrderDTO = z.infer<typeof createWorkOrderSchema>;

export const workOrderIdParamSchema = z.object({
  id: z.string().uuid({ message: 'O ID fornecido não é um UUID válido.' }),
});

export const updateWorkOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: 'Status inválido.',
  }).optional(),
  
  resolutionNotes: z.string()
    .trim()
    .max(2000, 'As notas de resolução devem ter no máximo 2000 caracteres.')
    .optional(),
  
  assigneeId: z.string()
    .uuid('O ID do responsável deve ser um UUID válido.')
    .optional(),
});

export type UpdateWorkOrderDTO = z.infer<typeof updateWorkOrderSchema>;