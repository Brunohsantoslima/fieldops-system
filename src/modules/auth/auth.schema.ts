import { z } from 'zod';

// 1. Schema do Zod para inferência de tipos TypeScript
export const loginBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// 2. Export do tipo que estava faltando (resolve os erros no TS)
export type LoginInput = z.infer<typeof loginBodySchema>;

// 3. Schema de validação em JSON Schema para o Fastify
export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};
// Adicione no final do arquivo src/modules/auth/auth.schema.ts
export const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      name: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['admin', 'supervisor', 'technician'] },
      teamId: { type: 'string' },
    },
  },
};

// 2️⃣ Tipo TypeScript para ser usado no Controller/Service
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'supervisor' | 'technician';
  teamId?: string;
};