# 🛠️ FieldOps v2.2 — Módulo de Equipes & Work Orders

> **Status do Projeto:** Entregue e Auditado ✅

Bem-vindo ao repositório do **FieldOps v2.2**. Este projeto implementa o núcleo do sistema de controle de ordens de serviço (Work Orders) e a gestão de acesso baseada em papéis (RBAC) para equipes de campo. 

## 🚀 1. A Jornada de Desenvolvimento (Dev Log)

O desenvolvimento deste módulo superou os seguintes desafios:
*   **Orquestração de Infraestrutura:** Levantamos um banco de dados PostgreSQL empacotado em Docker, utilizando `dotenvx` para injeção limpa de variáveis.
*   **A Crise de Sincronização:** Superamos um gargalo de versionamento, garantindo que o código de frontend e as lógicas de negócio fossem consolidadas na branch `main`.
*   **Engenharia Reversa de Requisitos:** Validamos o sistema contra uma auditoria estrita, ajustando payloads de Webhooks, garantindo a idempotência e formatando o contrato de resposta de erros (`AppError`).

## 🏗️ 2. Arquitetura e Stack Tecnológico

### Backend (Porta `3333`)
*   **Runtime:** Node.js
*   **Framework Web:** Fastify
*   **Banco de Dados & ORM:** PostgreSQL + Prisma
*   **Validação de Dados:** Zod 
*   **Autenticação:** JWT (JSON Web Tokens)
*   **Testes:** Vitest (com Mocks do Prisma)

### Frontend (Porta `5173`)
*   **Framework:** React construído com Vite.
*   **Integração:** Consumo da API REST e renderização condicional baseada nas funções (RBAC).

## 🎯 3. Regras de Negócio Implementadas

### 🔐 Role-Based Access Control (RBAC)
*   **Admin:** Acesso total.
*   **Supervisor:** Acesso restrito ao seu próprio time (`teamId`).
*   **Técnico:** Acesso severamente limitado. Pode apenas visualizar as OS atribuídas a ele. Rotas não autorizadas retornam `403 FLX_FORBIDDEN`.
### Segurança e Controle de Acesso (RBAC) no Frontend
Para garantir uma interface segura e ágil, o controle de acesso (RBAC) no lado do cliente é realizado através da decodificação nativa do token JWT. O payload do token é lido diretamente via JavaScript puro (utilizando `atob` para decodificação Base64), permitindo que o sistema verifique a *role* do usuário logado de forma imediata (ex: `admin`). Isso garante a renderização condicional de componentes sensíveis na UI, como a edição de equipes, sem a necessidade de importar bibliotecas externas pesadas para manipulação de tokens.
### 🔄 Máquina de Estados da Work Order (OS)
As Ordens de Serviço respeitam um ciclo de vida estrito (`open` ➔ `in_progress` ➔ `done`), com as seguintes proteções (Edge Cases):
1.  **Bloqueio de Prioridade:** Técnicos estão proibidos de concluir OS de prioridade `high`.
2.  **Proteção de Checklist:** Bloqueio de retorno ao status `open` se houver itens concluídos pendentes.
3.  **Auditoria de Resolução:** Mínimo de 10 caracteres nas notas.
4.  **Auditoria Transacional:** Evento de auditoria gravado na mesma transação do Prisma.

### ⚡ Concorrência e Webhooks
*   **Controle de Concorrência Otimista:** Implementado via campo `version` garantindo prevenção de `FLX_CONCURRENT_UPDATE`.
*   **Webhooks de Status:** Disparo automático com payload sanitizado e idempotência validada pelo `eventId`.

## 💻 4. Como Rodar o Projeto Localmente

1. Suba o container do banco:
   `docker-compose up -d`
2. Instale as dependências do backend e rode as migrations/seed:
   `npm install`
   `npx prisma migrate dev`
   `npx prisma db seed`
3. Inicie o servidor Backend:
   `npm run dev`
4. Em um novo terminal (`/web`), inicie o Frontend:
   `npm install`
   `npm run dev`

## 🗺️ 5. Diagrama do Fluxo Principal (Transição de Status)

```mermaid
graph TD
    A[Usuário/Frontend] -->|PATCH /work-orders/:id| B{Valida Escopo e Role?}
    B -->|Inválido| C[403 FLX_FORBIDDEN]
    B -->|Válido| D{Valida Concorrência version?}
    D -->|Conflito| E[409 FLX_CONCURRENT_UPDATE]
    D -->|OK| F[Transaction: Atualiza OS + Grava Evento]
    F --> G[Dispara Webhook POST com HMAC]
    G --> H[200 OK]

## 🏛️ 6. Architecture Decision Records (ADRs)

*   **ADR 001 - Concorrência Otimista (Optimistic Locking):** 
    *   **Contexto e Decisão:** Para evitar que dois usuários sobrescrevam as edições um do outro simultaneamente, optamos por usar um campo `version` (inteiro) na tabela `flx_work_orders` em vez de locks de banco de dados pessimistas.
    *   **Consequência:** A API permanece stateless e escalável. Se houver divergência de versão, o sistema rejeita a transição e retorna `409 FLX_CONCURRENT_UPDATE`, forçando o cliente a buscar os dados mais recentes.

*   **ADR 002 - Segurança de Webhooks via HMAC:**
    *   **Contexto e Decisão:** Para garantir que os sistemas de terceiros (ex: n8n) saibam que o webhook veio legitimamente da FieldOps, implementamos a assinatura do payload usando criptografia `HMAC-SHA256` anexada no header `X-Signature`.
    *   **Consequência:** Garante a integridade e a autenticidade da requisição, impedindo ataques de falsificação (spoofing).

*   **ADR 003 - Aplicação do RBAC Direto no Banco (Prisma):**
    *   **Contexto e Decisão:** O isolamento de escopo (ex: Técnicos só veem suas próprias OS) não é filtrado em memória no servidor, mas sim injetado diretamente nas queries condicionais do Prisma.
    *   **Consequência:** Previne vazamento de dados na origem (Data Leakage) e otimiza o uso de memória, garantindo que o banco de dados processe a paginação de forma precisa.

---

## 👥 7. Usuários Seed (Credenciais de Teste)

Para testar os diferentes escopos e papéis do sistema, utilize os usuários pré-configurados abaixo:

| Email                        | Senha       | Role       | teamId     |
| ---------------------------- | ----------- | ---------- | ---------- |
| tech-a@fieldops.eval         | password123 | technician | team-alpha |
| tech-b@fieldops.eval         | password123 | technician | team-beta  |
| supervisor-a@fieldops.eval   | password123 | supervisor | team-alpha |
| admin@fieldops.eval          | password123 | admin      | —          |

---

## 🚧 8. Limitações Conhecidas

Para mantermos o escopo de entrega focado nas regras de negócio principais e na robustez da API, assumimos as seguintes limitações:

1.  **Exclusão Física (DELETE):** A rota de exclusão física (`DELETE /work-orders/:id`) foi omitida de forma intencional em favor de um modelo focado no ciclo de vida (status), para preservar a integridade da tabela de auditoria (`flx_work_order_events`).
2.  **Suporte Offline:** O Frontend ainda não possui uma camada de *Service Workers* configurada para armazenamento em cache, necessitando de conexão ativa para submeter as resoluções de OS em campo.