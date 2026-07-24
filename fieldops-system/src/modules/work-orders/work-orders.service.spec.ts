import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrdersService } from './work-orders.service.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { OrderStatus, Priority } from '@prisma/client';

// Mock do Prisma para não sujarmos o banco de dados real durante os testes
vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    workOrder: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
    workOrderEvent: {
      create: vi.fn(),
    }
  },
}));

describe('WorkOrdersService - Testes Obrigatórios', () => {
  let service: WorkOrdersService;
  const mockAdminUser = { sub: 'user-1', role: 'admin', teamId: 'team-1' };
  const mockTechUser = { sub: 'tech-1', role: 'technician', teamId: 'team-1' };

  beforeEach(() => {
    service = new WorkOrdersService();
    vi.clearAllMocks();
  });

  // 1️⃣
  it('Deve criar uma OS com checklist inicial e version = 1', async () => {
    vi.mocked(prisma.workOrder.create).mockResolvedValue({ id: 'os-1', version: 1 } as any);

    const result = await service.create({ title: 'Nova OS', teamId: 'team-1' } as any, mockAdminUser);
    
    expect(prisma.workOrder.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ version: 1, checklist: expect.any(Object) })
    }));
    expect(result.version).toBe(1);
  });

  // 2️⃣
  it('Deve bloquear atualização concorrente (FLX_CONCURRENT_UPDATE)', async () => {
    const existingOrder = { id: 'os-1', version: 1, status: OrderStatus.open };
    service.findById = vi.fn().mockResolvedValue(existingOrder);

    await expect(service.update('os-1', { status: OrderStatus.in_progress, version: 2 }, mockAdminUser))
      .rejects.toBeInstanceOf(AppError);
  });

  // 3️⃣
  it('Deve bloquear transição de status inválida', async () => {
    const existingOrder = { id: 'os-1', version: 1, status: OrderStatus.done };
    service.findById = vi.fn().mockResolvedValue(existingOrder);

    await expect(service.update('os-1', { status: OrderStatus.open }, mockAdminUser))
      .rejects.toMatchObject({ code: 'FLX_INVALID_STATUS_TRANSITION' });
  });

  // 4️⃣
  it('Deve exigir notas de resolução (+10 chars) ao concluir a OS', async () => {
    const existingOrder = { id: 'os-1', version: 1, status: OrderStatus.in_progress };
    service.findById = vi.fn().mockResolvedValue(existingOrder);

    await expect(service.update('os-1', { status: OrderStatus.done, resolutionNotes: 'Curta' }, mockAdminUser))
      .rejects.toMatchObject({ message: expect.stringContaining('10 caracteres') });
  });

  // 5️⃣
  it('Deve impedir que Technician conclua OS de prioridade Alta', async () => {
    const existingOrder = { id: 'os-1', version: 1, status: OrderStatus.in_progress, priority: Priority.high, resolutionNotes: 'Notas válidas aqui.' };
    service.findById = vi.fn().mockResolvedValue(existingOrder);

    await expect(service.update('os-1', { status: OrderStatus.done }, mockTechUser))
      .rejects.toMatchObject({ code: 'FLX_FORBIDDEN' });
  });

  // 6️⃣
  it('Deve impedir reabertura de OS se não houver checklist pendente', async () => {
    const existingOrder = { 
      id: 'os-1', version: 1, status: OrderStatus.in_progress, 
      checklist: [{ completed: true }] 
    };
    service.findById = vi.fn().mockResolvedValue(existingOrder);

    await expect(service.update('os-1', { status: OrderStatus.open }, mockAdminUser))
      .rejects.toMatchObject({ message: expect.stringContaining('checklist') });
  });

  // 7️⃣
  it('Deve impedir que Technician delete uma OS', async () => {
    await expect(service.delete('os-1', mockTechUser))
      .rejects.toMatchObject({ code: 'FLX_FORBIDDEN' });
  });

  // 8️⃣
  it('Deve disparar o Webhook corretamente ao mudar de status', async () => {
    // 1. Adicionamos o teamId na OS existente
    const existingOrder = { id: 'os-1', version: 1, status: OrderStatus.open, teamId: 'team-1' };
    service.findById = vi.fn().mockResolvedValue(existingOrder);
    
    // 2. Ensinamos o Prisma a retornar um técnico válido e da mesma equipe
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
      id: 'tech-1', 
      teamId: 'team-1', 
      role: 'technician' 
    } as any);
    
    // Simula o retorno do Prisma $transaction
    vi.mocked(prisma.workOrder.update).mockResolvedValue({ id: 'os-1', status: OrderStatus.in_progress } as any);
    
    // Espiona o método do webhook
    const dispatchSpy = vi.spyOn(service['webhooksService'], 'dispatchStatusChange').mockResolvedValue();

    await service.update('os-1', { status: OrderStatus.in_progress, assigneeId: 'tech-1' }, mockAdminUser);
    
    expect(dispatchSpy).toHaveBeenCalled();
  });
});