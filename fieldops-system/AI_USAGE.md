# 🤖 Registro de Uso de Inteligência Artificial (AI_USAGE.md)

Este documento atesta com transparência o uso de assistentes de Inteligência Artificial durante o desenvolvimento do **FieldOps System**.

---

## 🎯 1. Escopo da Utilização de IA
As ferramentas de IA foram utilizadas principalmente para:
* Aceleração de código boilerplate (mapeamento de tipos TypeScript, esquemas Prisma).
* Apoio na estruturação inicial de layouts estilizados em Tailwind CSS.
* Diagnóstico de mensagens de erro no terminal e logs de rotas no React Router.

Todo o código gerado passou por revisão, refatoração manual e testes práticos de validação por parte do desenvolvedor.

---

## 🛑 2. Decisões Técnicas com Discordância de Sugestões da IA

### 1. Recusa de Geradores Automáticos de Interface (Figma AI / UI Auto-Generators)
* **Sugestão da IA:** Utilizar geradores de código automático a partir de layouts do Figma para construir as telas do frontend.
* **Decisão do Desenvolvedor:** A sugestão foi totalmente rejeitada. Optou-se por escrever manualmente cada componente em React com Tailwind CSS. Isso evitou abstrações desnecessárias, manteve o controle direto sobre o estado da aplicação (`useState`, `useEffect`) e garantiu o tratamento visual das regras da máquina de estados (exibir o `<textarea>` de `resolutionNotes` apenas quando o status for `in_progress`).

### 2. Resolução do Loop de Logout no Roteamento (`App.tsx`)
* **Sugestão da IA:** Adicionar checagens condicionais de token dentro de múltiplos `useEffect` e salvar flags adicionais no `localStorage` para conter o redirecionamento indevido na rota wildcard (`*`).
* **Decisão do Desenvolvedor:** Rejeitou-se a manipulação excessiva no `localStorage`. Identificou-se que a causa raiz era o mapeamento incorreto da rota coringa tratando URLs dinâmicas (`/work-orders/:id`) como inexistentes. A arquitetura de rotas foi refatorada manualmente criando o componente wrapper `RotaPrivada` e centralizando as subrotas dentro do componente de `Layout`.

---

## ✍️ 3. Módulos Desenvolvidos Manualmente
* **Lógica da Máquina de Estados:** Regras de transição de status no backend e bloqueio no frontend.
* **Validação de Prioridade Alta:** Trava de permissão que impede técnicos de concluírem OS com `priority: high`.
* **Cálculo da Assinatura HMAC-SHA256:** Implementação da função de hashing no disparo do Webhook.
* **Tratamento de Paginação (`perPage` -> `meta.limit`):** Ajuste fino do contrato de resposta para garantir conformidade com a especificação da prova.

---

## ⚠️ 4. Limitações Remanescentes
* Não há fila com política de retentativa (*retry policy*) persistida em Redis para Webhooks em caso de falha de conexão com a URL de destino.