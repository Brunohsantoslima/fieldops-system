import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

  async dispatchStatusChange(workOrder: any, fromStatus: string, toStatus: string) {
    const webhooks = await prisma.webhook.findMany();

    if (webhooks.length === 0) return;

    const payload = {
      event: 'work_order.status_changed',
      timestamp: new Date().toISOString(),
      data: {
        workOrderId: workOrder.id,
        fromStatus,
        toStatus,
        workOrder,
      },
    };

    const payloadString = JSON.stringify(payload);

    const promises = webhooks.map(async (webhook: any) => {
      // Gera a assinatura HMAC-SHA256 exigida
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');

      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-signature': `sha256=${signature}`,
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