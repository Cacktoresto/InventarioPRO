# Portal de Gestão de Ativos de TI — Documento Arquitetural

## 1. Visão geral

O Portal de Gestão de Ativos de TI será uma plataforma web construída do zero para governança do ciclo de vida de ativos corporativos de tecnologia. O Centro de Distribuição (CD) será a base central de governança, recebimento, padronização, controle, auditoria e redistribuição dos ativos entre Sede, Lojas e demais localidades.

A solução deverá priorizar:

- Rastreabilidade completa de cada ativo.
- Auditoria de alterações e decisões operacionais.
- Controle formal de posse, localização, status e ciclo de vida.
- Registro de termos de responsabilidade.
- Histórico imutável de eventos relevantes.
- Base consistente para dashboards gerenciais e indicadores.

## 2. Stack tecnológica obrigatória

- **Frontend e Backend Web:** Next.js 15 com App Router.
- **Linguagem:** TypeScript.
- **Estilização:** TailwindCSS.
- **Banco de dados:** PostgreSQL.
- **ORM:** Prisma ORM.
- **Arquitetura sugerida:** aplicação modular por domínio, com separação clara entre interface, casos de uso, regras de negócio, persistência e integrações.

## 3. Estrutura completa de diretórios do projeto

A estrutura abaixo é uma proposta arquitetural inicial. Ela ainda não representa implementação de telas.

```text
portal-gestao-ativos-ti/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (portal)/
│   │   ├── ativos/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── novo/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── descartes/
│   │   │   └── page.tsx
│   │   ├── devolucoes/
│   │   │   └── page.tsx
│   │   ├── entregas/
│   │   │   └── page.tsx
│   │   ├── importacoes/
│   │   │   └── page.tsx
│   │   ├── locais/
│   │   │   └── page.tsx
│   │   ├── manutencoes/
│   │   │   └── page.tsx
│   │   ├── movimentacoes/
│   │   │   └── page.tsx
│   │   ├── pessoas/
│   │   │   └── page.tsx
│   │   ├── relatorios/
│   │   │   └── page.tsx
│   │   ├── termos/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── ativos/
│   │   │   └── route.ts
│   │   ├── importacoes/
│   │   │   └── absolute/
│   │   │       └── route.ts
│   │   ├── termos/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── assets/
│   ├── audit/
│   ├── dashboard/
│   ├── forms/
│   ├── layout/
│   ├── tables/
│   └── ui/
├── config/
│   ├── app.ts
│   ├── navigation.ts
│   ├── permissions.ts
│   └── statuses.ts
├── docs/
│   ├── arquitetura-portal-gestao-ativos-ti.md
│   ├── decisoes-arquiteturais/
│   │   └── ADR-0001-stack-e-arquitetura.md
│   └── diagramas/
├── domain/
│   ├── assets/
│   │   ├── asset.entity.ts
│   │   ├── asset-status.enum.ts
│   │   ├── asset-type.enum.ts
│   │   ├── asset.rules.ts
│   │   └── asset.value-objects.ts
│   ├── audit/
│   │   ├── audit-event.entity.ts
│   │   └── audit-event-type.enum.ts
│   ├── disposal/
│   │   └── disposal.entity.ts
│   ├── imports/
│   │   ├── import-batch.entity.ts
│   │   └── import-row.entity.ts
│   ├── locations/
│   │   ├── location.entity.ts
│   │   └── location-type.enum.ts
│   ├── maintenance/
│   │   └── maintenance-order.entity.ts
│   ├── movements/
│   │   ├── assignment.entity.ts
│   │   ├── handover.entity.ts
│   │   ├── return.entity.ts
│   │   └── transfer.entity.ts
│   ├── people/
│   │   ├── person.entity.ts
│   │   └── department.entity.ts
│   ├── responsibility-terms/
│   │   ├── responsibility-term.entity.ts
│   │   └── responsibility-term-status.enum.ts
│   └── users/
│       ├── role.enum.ts
│       └── user.entity.ts
├── lib/
│   ├── auth/
│   ├── csv/
│   ├── dates/
│   ├── errors/
│   ├── logger/
│   ├── prisma.ts
│   ├── storage/
│   └── validation/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── repositories/
│   ├── asset.repository.ts
│   ├── audit.repository.ts
│   ├── import.repository.ts
│   ├── location.repository.ts
│   ├── maintenance.repository.ts
│   ├── movement.repository.ts
│   ├── person.repository.ts
│   └── term.repository.ts
├── services/
│   ├── absolute-import.service.ts
│   ├── asset-lifecycle.service.ts
│   ├── audit.service.ts
│   ├── dashboard.service.ts
│   ├── disposal.service.ts
│   ├── handover.service.ts
│   ├── maintenance.service.ts
│   ├── return.service.ts
│   ├── term-generation.service.ts
│   └── transfer.service.ts
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
├── types/
│   ├── api.ts
│   ├── dashboard.ts
│   └── filters.ts
└── package.json
```

## 4. Modelagem de domínio

O domínio deve ser organizado em torno do **ativo de TI** como entidade central. Todas as demais entidades existem para explicar onde o ativo está, quem é responsável por ele, em qual estado operacional ele se encontra, quais movimentações ocorreram, quais documentos foram emitidos e quais decisões foram tomadas durante seu ciclo de vida.

### Agregados principais

1. **Ativo**
   - Raiz do ciclo de vida.
   - Controla identificação patrimonial, tipo, status, localização atual, responsável atual e dados técnicos.

2. **Localização**
   - Representa CD, Sede, Loja, depósito interno, assistência técnica, área de descarte ou local lógico.
   - Permite hierarquia entre locais.

3. **Pessoa e Responsável**
   - Representa colaborador, terceiro, loja ou área responsável.
   - Pode assumir posse formal de um ativo por meio de entrega e termo.

4. **Movimentação**
   - Registra transferências físicas ou lógicas entre locais, responsáveis e estados.
   - Deve ser append-only sempre que possível.

5. **Termo de responsabilidade**
   - Documento formal gerado a partir de uma entrega, troca, devolução ou regularização.
   - Deve possuir status, versão, aceite e vínculo com os ativos contemplados.

6. **Importação Absolute**
   - Controla batches de CSV importados, linhas processadas, divergências, ativos criados e atualizações aplicadas.

7. **Manutenção**
   - Controla abertura, diagnóstico, envio, retorno, custo, fornecedor e conclusão.

8. **Descarte**
   - Controla baixa patrimonial, justificativa, evidências, aprovações e status final.

9. **Auditoria**
   - Registra eventos de negócio e alterações relevantes com usuário, data, origem, payload anterior e payload posterior.

## 5. Entidades principais

### Asset

Representa um ativo corporativo de TI.

Campos conceituais:

- `id`
- `assetTag` ou número patrimonial
- `serialNumber`
- `hostname`
- `type`
- `brand`
- `model`
- `specifications`
- `status`
- `currentLocationId`
- `currentResponsibleId`
- `purchaseDate`
- `warrantyEndDate`
- `source`
- `absoluteDeviceId`
- `createdAt`
- `updatedAt`
- `deletedAt`

### AssetType

Enum ou tabela de referência para tipos de ativo:

- Notebook
- Desktop
- Monitor
- Impressora
- Coletor
- Celular
- Periférico
- Servidor
- Rede
- Outro

### Location

Representa o local físico ou lógico do ativo.

Campos conceituais:

- `id`
- `name`
- `code`
- `type`
- `parentLocationId`
- `address`
- `isGovernanceBase`
- `active`

Tipos de local:

- CD
- Sede
- Loja
- Área interna
- Assistência técnica
- Fornecedor
- Descarte
- Trânsito

### Person

Representa uma pessoa ou entidade responsável.

Campos conceituais:

- `id`
- `name`
- `document`
- `email`
- `employeeCode`
- `departmentId`
- `locationId`
- `personType`
- `active`

Tipos:

- Colaborador
- Terceiro
- Responsável de loja
- Área interna
- Fornecedor

### User

Representa usuário autenticado no portal.

Campos conceituais:

- `id`
- `name`
- `email`
- `role`
- `personId`
- `active`
- `lastLoginAt`

### Assignment

Representa vínculo atual ou histórico entre ativo e responsável.

Campos conceituais:

- `id`
- `assetId`
- `responsibleId`
- `assignedByUserId`
- `startedAt`
- `endedAt`
- `assignmentReason`
- `responsibilityTermId`

### Handover

Representa entrega formal de equipamento.

Campos conceituais:

- `id`
- `assetId`
- `responsibleId`
- `originLocationId`
- `destinationLocationId`
- `deliveredByUserId`
- `deliveredAt`
- `conditionNotes`
- `accessories`
- `responsibilityTermId`

### Return

Representa devolução formal de equipamento.

Campos conceituais:

- `id`
- `assetId`
- `responsibleId`
- `returnLocationId`
- `receivedByUserId`
- `returnedAt`
- `conditionNotes`
- `pendingItems`
- `responsibilityTermId`

### Transfer

Representa movimentação entre locais.

Campos conceituais:

- `id`
- `assetId`
- `fromLocationId`
- `toLocationId`
- `requestedByUserId`
- `approvedByUserId`
- `executedByUserId`
- `requestedAt`
- `approvedAt`
- `executedAt`
- `status`
- `reason`

### MaintenanceOrder

Representa processo de manutenção.

Campos conceituais:

- `id`
- `assetId`
- `openedByUserId`
- `providerId`
- `openedAt`
- `sentAt`
- `returnedAt`
- `closedAt`
- `problemDescription`
- `diagnosis`
- `solution`
- `cost`
- `status`

### Disposal

Representa processo de descarte ou baixa.

Campos conceituais:

- `id`
- `assetId`
- `requestedByUserId`
- `approvedByUserId`
- `requestedAt`
- `approvedAt`
- `disposedAt`
- `reason`
- `evidenceUrl`
- `status`

### ResponsibilityTerm

Representa termo formal de responsabilidade.

Campos conceituais:

- `id`
- `termNumber`
- `responsibleId`
- `generatedByUserId`
- `generatedAt`
- `acceptedAt`
- `revokedAt`
- `status`
- `documentUrl`
- `version`

### ResponsibilityTermItem

Representa os ativos incluídos em um termo.

Campos conceituais:

- `id`
- `responsibilityTermId`
- `assetId`
- `conditionNotes`
- `accessories`

### ImportBatch

Representa um arquivo CSV importado do Absolute.

Campos conceituais:

- `id`
- `source`
- `fileName`
- `fileHash`
- `uploadedByUserId`
- `uploadedAt`
- `processedAt`
- `status`
- `totalRows`
- `successRows`
- `errorRows`

### ImportRow

Representa uma linha do CSV.

Campos conceituais:

- `id`
- `importBatchId`
- `rowNumber`
- `rawData`
- `normalizedData`
- `status`
- `errorMessage`
- `assetId`

### AuditEvent

Representa evento auditável.

Campos conceituais:

- `id`
- `entityType`
- `entityId`
- `eventType`
- `actorUserId`
- `occurredAt`
- `ipAddress`
- `userAgent`
- `beforePayload`
- `afterPayload`
- `metadata`

## 6. Relacionamentos entre entidades

- Um **Asset** pertence a uma **Location** atual.
- Um **Asset** pode possuir uma **Person** responsável atual.
- Um **Asset** possui muitas **Assignments** ao longo do tempo.
- Um **Asset** possui muitas **Transfers**.
- Um **Asset** possui muitas **MaintenanceOrders**.
- Um **Asset** pode possuir zero ou um **Disposal** concluído.
- Um **Asset** pode estar em muitos **ResponsibilityTermItems**.
- Um **ResponsibilityTerm** pertence a uma **Person** responsável.
- Um **ResponsibilityTerm** possui muitos **ResponsibilityTermItems**.
- Uma **Location** pode conter várias sublocalizações por `parentLocationId`.
- Uma **Person** pode estar associada a uma **Department** e a uma **Location** base.
- Um **ImportBatch** possui muitas **ImportRows**.
- Uma **ImportRow** pode criar ou atualizar um **Asset**.
- Um **User** pode estar vinculado a uma **Person**.
- Um **User** executa ações registradas em **AuditEvent**.
- Toda entidade operacional relevante deve gerar um ou mais **AuditEvents**.

## 7. Fluxos de negócio

### 7.1 Cadastro manual de ativo

1. Usuário autorizado informa dados patrimoniais e técnicos.
2. Sistema valida unicidade de número de série, patrimônio e hostname quando aplicável.
3. Sistema cria ativo em status inicial apropriado.
4. Sistema registra localização inicial, preferencialmente CD.
5. Sistema grava evento de auditoria `ASSET_CREATED`.

### 7.2 Importação de ativos via CSV do Absolute

1. Usuário envia arquivo CSV exportado do Absolute.
2. Sistema cria um `ImportBatch`.
3. Sistema calcula hash do arquivo para evitar importação duplicada acidental.
4. Sistema normaliza colunas e valida campos obrigatórios.
5. Para cada linha:
   - identifica ativo por `absoluteDeviceId`, número de série, hostname ou regra configurada;
   - cria novo ativo quando não existir;
   - atualiza dados técnicos quando existir;
   - registra divergências para revisão humana quando houver conflito.
6. Sistema consolida resultado da importação.
7. Sistema registra auditoria por batch e por ativo alterado.

### 7.3 Entrega de equipamento

1. Usuário seleciona ativo disponível.
2. Usuário seleciona responsável e destino.
3. Sistema valida se ativo pode ser entregue.
4. Sistema cria registro de entrega.
5. Sistema cria ou atualiza vínculo de responsabilidade.
6. Sistema gera termo de responsabilidade.
7. Sistema altera status do ativo para `EM_USO`.
8. Sistema registra evento de auditoria e histórico.

### 7.4 Devolução de equipamento

1. Usuário localiza ativo em uso.
2. Usuário registra responsável devolvente, condição física, acessórios e pendências.
3. Sistema encerra vínculo de responsabilidade ativo.
4. Sistema atualiza localização para CD, Sede ou local de recebimento.
5. Sistema altera status conforme avaliação: disponível, em triagem ou manutenção.
6. Sistema revoga ou encerra termo anterior.
7. Sistema registra auditoria.

### 7.5 Movimentação entre locais

1. Usuário solicita transferência de origem para destino.
2. Sistema valida permissões, status e restrições.
3. Fluxo pode exigir aprovação para movimentações entre CD, Sede e Lojas.
4. Sistema registra saída, trânsito e recebimento.
5. Sistema atualiza localização atual apenas na confirmação de recebimento.
6. Sistema registra auditoria em cada etapa.

### 7.6 Manutenção

1. Usuário abre ordem de manutenção vinculada ao ativo.
2. Sistema altera status para `EM_MANUTENCAO` ou `AGUARDANDO_MANUTENCAO`.
3. Ativo pode ser enviado a fornecedor ou assistência.
4. Diagnóstico, custo e solução são registrados.
5. Ao concluir, sistema define se ativo retorna para estoque, uso, descarte ou nova manutenção.
6. Sistema registra auditoria e histórico técnico.

### 7.7 Descarte

1. Usuário solicita descarte informando motivo e evidências.
2. Sistema valida se não há responsabilidade ativa pendente.
3. Fluxo exige aprovação por perfil autorizado.
4. Após aprovação, sistema altera status para `DESCARTADO`.
5. Sistema bloqueia novas entregas, movimentações operacionais e manutenções comuns.
6. Sistema mantém histórico consultável para auditoria.

### 7.8 Geração e aceite de termo de responsabilidade

1. Sistema recebe dados de entrega ou regularização.
2. Sistema gera termo com lista de ativos, responsável, condições e acessórios.
3. Termo recebe número e versão.
4. Responsável pode aceitar digitalmente, quando o fluxo for habilitado.
5. Sistema registra aceite, IP, data e usuário.
6. Termo permanece vinculado ao ativo mesmo após devolução, como evidência histórica.

### 7.9 Dashboard gerencial

Indicadores sugeridos:

- Total de ativos por tipo.
- Total de ativos por status.
- Ativos por localização.
- Ativos em uso por área, loja ou responsável.
- Ativos disponíveis no CD.
- Ativos em manutenção por tempo de permanência.
- Ativos sem responsável definido.
- Ativos sem patrimônio ou sem serial.
- Importações com erro.
- Movimentações pendentes de recebimento.
- Descartes pendentes de aprovação.

## 8. Perfis de usuário

### Administrador do sistema

- Gerencia parâmetros globais, perfis, permissões e cadastros estruturais.
- Acesso completo à auditoria e configurações.

### Governança de TI do CD

- Controla estoque central.
- Aprova movimentações relevantes.
- Executa importações Absolute.
- Realiza entregas, devoluções, manutenção e descarte.
- Visualiza dashboards completos.

### Operador de TI

- Cadastra e atualiza ativos conforme permissão.
- Registra entregas, devoluções, movimentações e manutenção.
- Consulta histórico operacional.

### Gestor de TI

- Acompanha indicadores.
- Aprova descarte e movimentações críticas.
- Consulta relatórios e auditoria.

### Responsável de loja ou área

- Consulta ativos sob responsabilidade de sua loja ou área.
- Confirma recebimentos e devoluções quando aplicável.
- Acessa termos relacionados.

### Auditor

- Acesso somente leitura.
- Consulta histórico, termos, eventos e relatórios.
- Não executa alterações operacionais.

### Solicitante

- Perfil opcional para abrir solicitações de equipamento, devolução ou manutenção.
- Não altera inventário diretamente.

## 9. Estados possíveis dos ativos

Estados recomendados para o ciclo de vida:

- `CADASTRADO`: ativo criado, ainda sem validação completa.
- `DISPONIVEL`: apto para entrega ou movimentação.
- `RESERVADO`: separado para uma solicitação ou entrega futura.
- `EM_USO`: entregue a responsável, loja ou área.
- `EM_TRANSITO`: em movimentação entre locais.
- `AGUARDANDO_RECEBIMENTO`: enviado e pendente de confirmação no destino.
- `EM_TRIAGEM`: recebido e aguardando avaliação.
- `AGUARDANDO_MANUTENCAO`: identificado problema, ainda não enviado ou iniciado.
- `EM_MANUTENCAO`: em assistência interna ou externa.
- `RETORNADO_MANUTENCAO`: voltou de manutenção e aguarda decisão.
- `BLOQUEADO`: impedido temporariamente por inconsistência, auditoria ou pendência.
- `EXTRAVIADO`: não localizado após apuração.
- `ROUBADO_FURTADO`: registrado como roubo ou furto, com evidência formal.
- `OBSOLETO`: sem recomendação de uso, aguardando decisão.
- `AGUARDANDO_DESCARTE`: aprovado tecnicamente para baixa, aguardando fluxo final.
- `DESCARTADO`: baixado definitivamente.

### Regras gerais de transição

- Apenas ativos `DISPONIVEL` ou `RESERVADO` podem ser entregues.
- Ativos `EM_USO` devem possuir responsável ativo.
- Ativos `DESCARTADO` não podem retornar ao ciclo operacional sem processo formal de reversão administrativa.
- Ativos `EM_TRANSITO` não devem mudar de responsável até confirmação de recebimento.
- Ativos com termo pendente devem aparecer em indicadores de inconsistência.
- Toda alteração de status deve gerar histórico e auditoria.

## 10. Roadmap técnico de implementação em fases

### Fase 0 — Fundação técnica

- Inicializar projeto Next.js 15 com TypeScript, App Router e TailwindCSS.
- Configurar PostgreSQL e Prisma ORM.
- Definir padrões de lint, formatação, testes e variáveis de ambiente.
- Criar estrutura modular de domínio, serviços e repositórios.
- Documentar decisões arquiteturais iniciais.

### Fase 1 — Modelo de dados e autenticação

- Implementar schema Prisma inicial.
- Criar migrations para entidades centrais.
- Implementar autenticação e autorização baseada em perfis.
- Criar seed de perfis, permissões e locais principais.
- Implementar auditoria técnica mínima.

### Fase 2 — Inventário base

- Implementar cadastro e consulta de ativos.
- Implementar cadastro de locais, pessoas e departamentos.
- Implementar filtros básicos.
- Implementar histórico do ativo.
- Implementar validações de unicidade.

### Fase 3 — Importação Absolute

- Implementar upload e processamento de CSV.
- Criar normalização de colunas.
- Implementar detecção de duplicidades e divergências.
- Criar tela futura de revisão de erros.
- Auditar criação e atualização por importação.

### Fase 4 — Ciclo de vida operacional

- Implementar entrega.
- Implementar devolução.
- Implementar movimentação entre locais.
- Implementar manutenção.
- Implementar descarte com aprovação.
- Consolidar regras de transição de status.

### Fase 5 — Termos e documentos

- Implementar geração de termo de responsabilidade.
- Implementar versionamento de termos.
- Implementar aceite digital, quando requerido.
- Implementar armazenamento seguro de documentos.
- Vincular termos ao histórico dos ativos.

### Fase 6 — Dashboard e relatórios

- Implementar indicadores gerenciais.
- Implementar relatórios por status, local, responsável e tipo.
- Implementar exportações controladas.
- Criar visões específicas por perfil.

### Fase 7 — Auditoria avançada e governança

- Fortalecer trilha de auditoria.
- Implementar alertas de inconsistência.
- Implementar políticas de retenção de dados.
- Criar revisões periódicas de inventário.
- Implementar trilhas de aprovação configuráveis.

### Fase 8 — Escalabilidade e integrações futuras

- Avaliar filas assíncronas para importações e geração de documentos.
- Integrar com diretório corporativo ou provedor SSO.
- Integrar com sistemas de chamados.
- Integrar com serviços de assinatura digital.
- Criar APIs públicas internas para consulta de ativos.

## 11. Boas práticas para escalabilidade futura

### Arquitetura e domínio

- Manter regras de negócio em serviços de aplicação e domínio, não nas telas.
- Centralizar transições de status em um serviço de ciclo de vida.
- Tratar movimentações, entregas, devoluções e manutenções como eventos históricos, não apenas atualizações simples do ativo.
- Evitar exclusão física de dados relevantes; preferir `deletedAt` e trilhas de auditoria.
- Usar identificadores internos imutáveis e permitir alteração controlada de dados externos, como hostname.

### Banco de dados

- Criar índices para campos de busca frequente: patrimônio, serial, hostname, status, localização e responsável.
- Usar constraints para unicidade quando a regra for absoluta.
- Usar tabelas históricas para vínculos temporais.
- Planejar particionamento futuro para eventos de auditoria, se o volume crescer.
- Usar transações em operações de ciclo de vida para manter consistência.

### Auditoria e rastreabilidade

- Registrar `actorUserId`, data, IP, user agent e origem da operação.
- Persistir payload anterior e posterior em alterações críticas.
- Diferenciar eventos técnicos de eventos de negócio.
- Garantir que importações em lote sejam rastreáveis até a linha de origem.
- Tornar histórico do ativo consultável em ordem cronológica.

### Segurança

- Aplicar RBAC desde o início.
- Validar permissões no servidor, não apenas na interface.
- Proteger endpoints de importação e exportação.
- Evitar exposição indevida de dados pessoais em relatórios.
- Registrar acessos a documentos sensíveis.

### Performance

- Paginar listagens obrigatoriamente.
- Usar filtros indexados e evitar consultas sem critério em bases grandes.
- Processar importações grandes de forma assíncrona no futuro.
- Pré-agregar indicadores críticos quando necessário.
- Separar consultas analíticas pesadas das operações transacionais, se o volume justificar.

### Qualidade

- Criar testes unitários para regras de status.
- Criar testes de integração para fluxos de entrega, devolução, movimentação, manutenção e descarte.
- Criar testes para importação de CSV com cenários de duplicidade e inconsistência.
- Usar ADRs para decisões relevantes.
- Manter documentação do domínio atualizada junto com mudanças no schema.

## 12. Decisões arquiteturais iniciais recomendadas

- O CD deve ser cadastrado como `Location` com `isGovernanceBase = true`.
- O ativo deve sempre possuir uma localização atual.
- O responsável atual pode ser nulo apenas em estados controlados, como `DISPONIVEL`, `EM_TRIAGEM`, `EM_MANUTENCAO`, `AGUARDANDO_DESCARTE` e `DESCARTADO`.
- O histórico deve ser derivado de eventos e registros operacionais, não apenas de campos atuais.
- Importações do Absolute não devem sobrescrever dados manuais sensíveis sem regra explícita de precedência.
- Descarte deve ser irreversível para operação comum.
- Termos devem ser versionados e preservados mesmo após devolução.
