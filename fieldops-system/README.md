# 🛠️ FieldOps System — Gestão de Ordens de Serviço (v2.2)

O **FieldOps System** é uma plataforma full-stack desenvolvida para a gestão eficiente do ciclo de vida de Ordens de Serviço (OS) em operações de campo. O sistema garante o cumprimento rigoroso de regras de negócio, incluindo controle de acesso baseado em papéis (RBAC), isolamento de dados por equipes, prevenção de concorrência e integração via Webhooks assinados.

---

## 📋 Sumário
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Máquina de Estados e Regras de Negócio](#-máquina-de-estados-e-regras-de-negócio)
- [Nossa Linha de Raciocínio (ADRs)](#-nossa-linha-de-raciocínio-adrs)
- [Usuários Seed para Avaliação](#-usuários-seed-para-avaliação)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Limitações Conhecidas](#-limitações-conhecidas)

---

## 🏗️ Arquitetura do Sistema

O sistema adota uma arquitetura cliente-servidor padrão, com separação clara de responsabilidades e foco em segurança.

```mermaid
flowchart LR
    A[Frontend React] <-->|JWT / JSON| B(Backend Node.js API)
    B <-->|Prisma ORM| C[(PostgreSQL)]
    B -->|HMAC-SHA256| D[Webhook Externo]
    
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#339933,stroke:#333,stroke-width:2px,color:#fff;
    classDef database fill:#336791,stroke:#333,stroke-width:2px,color:#fff;
    classDef webhook fill:#ff9900,stroke:#333,stroke-width:2px,color:#000;
    
    class A frontend;
    class B backend;
    class C database;
    class D webhook;