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