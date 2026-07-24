import { FastifyRequest, FastifyReply } from 'fastify';
import { WebhooksService } from './webhooks.service.js';
import { z } from 'zod'; // Assumindo que você usa Zod para validação

const webhooksService = new WebhooksService();

export class WebhooksController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    // Validação do corpo da requisição
    const createWebhookSchema = z.object({
      url: z.string().url({ message: "URL inválida" }),
      secret: z.string().min(6, { message: "O secret deve ter no mínimo 6 caracteres" }),
    });

    const data = createWebhookSchema.parse(request.body);
    
    const webhook = await webhooksService.create(data);

    return reply.status(201).send(webhook);
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const webhooks = await webhooksService.findAll();
    return reply.status(200).send(webhooks);
  }
}