import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './errors/app-error.js';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  // 1️⃣ Erros de Validação (Zod ou Validador Nativo do Fastify)
  if (error instanceof ZodError || error.validation || error.statusCode === 400) {
    return reply.status(400).send({
      message: 'Erro de validação nos dados enviados.',
      code: 'FLX_VALIDATION_ERROR',
      details: error.message,
    });
  }

  // 2️⃣ Erros de Autenticação / JWT (sem token ou token inválido)
  if (
    error.statusCode === 401 ||
    error.code?.startsWith('FST_JWT_') ||
    error.name === 'UnauthorizedError'
  ) {
    return reply.status(401).send({
      message: 'Não autorizado: token ausente ou inválido.',
      code: 'FLX_UNAUTHORIZED',
    });
  }

  // 3️⃣ Erros de Negócio da Aplicação (ex: e-mail/senha incorretos)
  if (error instanceof AppError) {
    return reply.status(error.statusCode ?? 400).send({
      message: error.message,
      code: error.code,
    });
  }

  // 🐛 Log no console para depuração
  console.error(error);

  // 4️⃣ Erro genérico do servidor
  return reply.status(500).send({
    message: 'Erro interno do servidor.',
    code: 'FLX_INTERNAL_ERROR',
  });
}