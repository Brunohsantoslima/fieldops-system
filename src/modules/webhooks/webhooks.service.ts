import crypto, { randomUUID } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';

export class WebhooksService {
  async create(data: { url: string; secret: string }) {
    return await prisma.webhook.create({
      data: {
        url: data.url,
        secret: data.secret,
      },
    });
  }

  async findAll() {
    return await prisma.webhook.findMany();
  }

  // 👇 Adicionamos o 'actorId' para bater com a documentação do payload
  async dispatchStatusChange(workOrder: any, fromStatus: string, toStatus: string, actorId: string | number) {
    const webhooks = await prisma.webhook.findMany();

    if (webhooks.length === 0) return;

    // 👇 O payload montado exatamente como a especificação exige
    const payload = {
      eventId: randomUUID(), // ID único do evento
      workOrderId: workOrder.id,
      fromStatus,
      toStatus,
      actorId,
      occurredAt: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);

    const promises = webhooks.map(async (webhook: any) => {
      // Gera a assinatura HMAC-SHA256 apenas em hex
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');

      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Revision': '2026.2', // Header exigido pela versão 2.2
            'X-Signature': signature,   // Nome exato exigido na prova
          },
          body: payloadString,
        });
        console.log(`✅ Webhook disparado: ${webhook.url}`);
      } catch (error) {
        console.error(`❌ Erro webhook ${webhook.url}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}