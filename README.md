# InventarioPRO

Fundação técnica do **Portal de Gestão de Ativos de TI**, estruturada para evoluir com Next.js/TypeScript e Prisma ORM sobre PostgreSQL. Esta etapa ainda não cria telas, autenticação nem rotas de API; o foco é a base de persistência, migrations e seed inicial.

## Pré-requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- PostgreSQL 15 ou superior em execução.

## Instalação das dependências

```bash
npm install
```

## Configuração do banco PostgreSQL

1. Crie um banco PostgreSQL para a aplicação. Exemplo:

   ```sql
   CREATE DATABASE inventario_pro;
   ```

2. Copie o arquivo de exemplo de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Ajuste a variável `DATABASE_URL` no `.env` com as credenciais do seu PostgreSQL:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventario_pro?schema=public"
   ```

## Prisma ORM

### Gerar Prisma Client

```bash
npm run prisma:generate
```

### Rodar migrations

```bash
npm run prisma:migrate:dev
```

Esse comando aplica a migration inicial em `prisma/migrations` e prepara o schema PostgreSQL com as entidades principais do domínio.

### Executar seed

```bash
npm run prisma:db:seed
```

O seed cria:

- usuário administrador;
- localização CD;
- localização Sede;
- lojas fictícias;
- ativos fictícios;
- vínculo inicial de responsabilidade;
- eventos básicos de auditoria.

### Abrir Prisma Studio

```bash
npm run prisma:studio
```

## Modelo inicial de dados

O schema inicial está em `prisma/schema.prisma` e inclui os modelos:

- `User`
- `Person`
- `Location`
- `Asset`
- `AssetAssignment`
- `AssetMovement`
- `MaintenanceOrder`
- `DisposalRequest`
- `ResponsibilityTerm`
- `ImportBatch`
- `ImportRow`
- `AuditEvent`

Também foram criados enums para papéis, tipos/status/origens de ativos, tipos de localização, tipos de movimentação, termos, manutenção, descarte e importações.

## Fluxo recomendado para rodar do zero

```bash
npm install
cp .env.example .env
# edite o .env com a URL real do PostgreSQL
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:db:seed
npm run prisma:studio
```
