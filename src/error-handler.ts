import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './errors/app-error.js';
import { randomUUID } from 'node:crypto';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  // Gera o ID único de rastreio exigido pela especificação
  const flxTraceId = randomUUID();

  // 1️⃣ Erros de Validação (Zod ou Validador Nativo do Fastify)
  if (error instanceof ZodError || error.validation || error.statusCode === 400) {
    return reply.status(400).send({
      error: {
        code: 'FLX_VALIDATION_ERROR',
        message: 'Erro de validação nos dados enviados.',
        flxTraceId,
        details: error.message,
      }
    });
  }

  // 2️⃣ Erros de Autenticação / JWT (sem token ou token inválido)
  if (
    error.statusCode === 401 ||
    error.code?.startsWith('FST_JWT_') ||
    error.name === 'UnauthorizedError'
  ) {
    return reply.status(401).send({
      error: {
        code: 'FLX_UNAUTHORIZED',
        message: 'Não autorizado: token ausente ou inválido.',
        flxTraceId,
        details: {}
      }
    });
  }

  // 3️⃣ Erros de Negócio da Aplicação (ex: concorrência, status inválido)
  if (error instanceof AppError) {
    return reply.status(error.statusCode ?? 400).send({
      error: {
        code: error.code,
        message: error.message,
        flxTraceId,
        // Caso seu AppError tenha a propriedade details, a incluímos aqui:
        details: (error as any).details || {} 
      }
    });
  }

  // 🐛 Log no console para depuração
  console.error(error);

  // 4️⃣ Erro genérico do servidor
  return reply.status(500).send({
    error: {
      code: 'FLX_INTERNAL_ERROR',
      message: 'Erro interno do servidor.',
      flxTraceId,
      details: {}
    }
  });
}