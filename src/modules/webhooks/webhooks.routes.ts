import { FastifyInstance } from 'fastify';
import { WebhooksController } from './webhooks.controller.js';
// ⚠️ ATENÇÃO: Ajuste o caminho do seu middleware de JWT se ele estiver em outra pasta
// import { verifyJwt } from '../../middlewares/verify-jwt.js'; 

const webhooksController = new WebhooksController();

export async function webhooksRoutes(app: FastifyInstance) {
  // Se a banca exigir que apenas Admin cadastre webhooks, você adiciona o middleware aqui
  // app.addHook('onRequest', verifyJwt);

  app.post('/', webhooksController.create.bind(webhooksController));
  app.get('/', webhooksController.findAll.bind(webhooksController));
}