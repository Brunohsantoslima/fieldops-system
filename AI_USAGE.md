# Declaração de Uso de Inteligência Artificial (AI Usage)

Em conformidade com os requisitos de transparência e boas práticas de engenharia de software, este documento detalha como ferramentas de Inteligência Artificial foram utilizadas durante o desenvolvimento do projeto **FieldOps v2.2**.

## 🛠️ Ferramentas Utilizadas
*   **Gemini (Google):** Utilizado como assistente de codificação e auditor de arquitetura.

## 🎯 Como a IA foi aplicada

A Inteligência Artificial foi empregada estritamente como um acelerador de produtividade (pair programming) e não como substituta para a tomada de decisão técnica. Os casos de uso incluíram:

1.  **Geração de Boilerplate:** Criação de esqueletos iniciais para rotas do Fastify e configurações básicas do Vite/React.
2.  **Refatoração e Expressões Regulares:** Otimização de blocos de validação Zod e auxílio na formatação de mensagens de erro padronizadas.
3.  **Auditoria de Requisitos:** Revisão cruzada entre o código implementado e o PDF de requisitos da prova, ajudando a identificar "edge cases" faltantes (como a formatação exata do endpoint `/health` e os payloads do Webhook).
4.  **Troubleshooting:** Diagnóstico rápido de erros de portas presas no Docker e conflitos de merge no Git.
5. **Troubleshooting de Tipagem (TypeScript):** A IA foi utilizada para diagnosticar rapidamente um conflito de interface (`Property 'user' does not exist on type 'AuthContextData'`) no componente de gestão de equipes, garantindo o alinhamento correto entre o hook de autenticação e a tipagem estrita do React.
6. **Lógica de Segurança no Frontend (JWT):** O assistente auxiliou na estruturação do algoritmo de decodificação nativa do JWT no client-side (utilizando `split`, `atob` e `JSON.parse`). Isso permitiu extrair as permissões do usuário em tempo real e aplicar as regras de negócio do RBAC na interface visual de forma leve e performática.
## 🚫 O que foi feito exclusivamente de forma humana

Para garantir a autoria e a proficiência técnica exigidas pela avaliação, a IA **não** foi utilizada para conceber:

*   **A lógica do RBAC e da Máquina de Estados:** As regras de negócio centrais, restrições e transições do Prisma foram desenhadas manualmente.
*   **Decisões de Arquitetura de Banco de Dados:** A estrutura de relacionamentos entre Usuários, Equipes e Work Orders no `schema.prisma`.
*   **A suíte de testes (Mocks lógicos):** O mapeamento de cenários de teste e a injeção de dependências falsas (mocks) para o Vitest.
* **Arquitetura e Modelagem de Dados:** A concepção estrutural do banco de dados (PostgreSQL), incluindo a modelagem do *schema* via Prisma e a definição minuciosa dos relacionamentos (1:N, N:N) entre Usuários, Equipes e Ordens de Serviço.
* **Setup de Infraestrutura e Integração:** A inicialização do ecossistema, configuração do contêiner Docker para o banco, estruturação do servidor Fastify (Node.js) e do empacotador Vite (React), definindo a espinha dorsal do projeto.
* **Definição das Regras de Negócio (Domain Logic):** O desenho da lógica *core* do sistema, como os ciclos de vida das Work Orders (transições de status permitidas) e a estrutura hierárquica do RBAC (Administrador, Supervisor, Técnico).
* **Design System e UI/UX:** A construção visual da interface, navegação, componentização (modais, tabelas) e estilização responsiva utilizando Tailwind CSS, focando na melhor experiência do usuário final.
* **Auditoria e Curadoria de Código:** Toda e qualquer sugestão ou bloco de código gerado por ferramentas de IA passou por um rigoroso *code review* humano. Nenhuma implementação foi aprovada sem validação de tipagem, segurança e alinhamento com as boas práticas exigidas pelo projeto.

## ⚖️ Divergências com a Inteligência Artificial

Durante o desenvolvimento do controle de acesso no frontend (Equipes/RBAC), o assistente de IA sugeriu a instalação da biblioteca externa `jwt-decode` para extrair as roles do token JWT. 
**Decisão:** Eu discordei e rejeitei a sugestão. 
**Motivo:** Para um escopo onde apenas precisávamos ler as *claims* básicas (role e teamId), adicionar uma dependência extra ao *bundle* do React seria um exagero. Optei por implementar uma solução nativa e mais leve utilizando `atob()` e `JSON.parse()`, garantindo a mesma funcionalidade com zero impacto no tamanho do pacote.

## 🚧 Limitações Conhecidas (Trade-offs)

Devido ao escopo de tempo (12 a 16 horas estimadas) e foco na estabilidade das regras de negócio, as seguintes limitações foram aceitas nesta entrega:
*   **Suporte Offline:** A aplicação frontend não possui cache avançado (Service Workers/PWA) para permitir que técnicos preencham o checklist de OS em áreas sem cobertura de rede.
*   **Cobertura E2E:** Embora os testes unitários e de integração (Vitest) cubram os cenários críticos de RBAC e Concorrência exigidos, a aplicação não possui uma suíte de testes End-to-End (ex: Cypress/Playwright) automatizando o fluxo completo na interface gráfica.