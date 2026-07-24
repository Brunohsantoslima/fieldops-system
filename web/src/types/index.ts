// src/types/index.ts

// ==========================================
// ENUMS (O Contrato Fixo)
// ==========================================
export type Role = 'technician' | 'supervisor' | 'admin';
export type OrderStatus = 'open' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

// ==========================================
// MODELS (As Entidades do Sistema)
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
  // Nota: 'password' foi intencionalmente omitido no frontend
}

export interface ChecklistItem {
  id: string;
  workOrderId: string;
  label: string;
  completed: boolean;
}

export interface WorkOrderEvent {
  id: string;
  workOrderId: string;
  actorId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  createdAt: string;
  actor?: User; // Opcional, caso a API faça um join (include)
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: OrderStatus;
  priority: Priority;
  resolutionNotes: string | null;
  assigneeId: string | null;
  teamId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos (Podem ou não vir na requisição dependendo da rota)
  assignee?: User | null;
  checklist?: ChecklistItem[];
  events?: WorkOrderEvent[];
}