import { z } from 'zod';
import { Priority, OrderStatus } from '@prisma/client';

export const createWorkOrderSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority, {
    message: 'Prioridade inválida.',
  }),
  teamId: z.string().min(1, 'O ID/slug do time é obrigatório.'),
  assigneeId: z.string().uuid('O ID do responsável deve ser um UUID válido.'),
});

export type CreateWorkOrderDTO = z.infer<typeof createWorkOrderSchema>;

// Validação do parâmetro de rota :id
export const workOrderIdParamSchema = z.object({
  id: z.string().uuid({ message: 'O ID fornecido não é um UUID válido.' }),
});

// Validação para o body do PATCH (todos os campos opcionais)
export const updateWorkOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: 'Status inválido.',
  }).optional(),
  resolutionNotes: z.string().optional(),
  assigneeId: z.string().uuid('O ID do responsável deve ser um UUID válido.').optional(),
});

export type UpdateWorkOrderDTO = z.infer<typeof updateWorkOrderSchema>;