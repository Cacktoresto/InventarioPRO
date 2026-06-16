import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminPerson = await prisma.person.upsert({
    where: { email: "admin@inventariopro.local" },
    update: {},
    create: {
      name: "Administrador InventarioPRO",
      email: "admin@inventariopro.local",
      employeeCode: "ADM-001",
      department: "Governança de TI",
      personType: "EMPLOYEE",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@inventariopro.local" },
    update: { isActive: true, role: "ADMIN", personId: adminPerson.id, passwordHash: hashPassword("admin123") },
    create: {
      name: "Administrador InventarioPRO",
      email: "admin@inventariopro.local",
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
      personId: adminPerson.id,
    },
  });

  const cd = await prisma.location.upsert({
    where: { code: "CD-001" },
    update: {},
    create: {
      name: "Centro de Distribuição",
      code: "CD-001",
      type: "DISTRIBUTION_CENTER",
      address: "Av. Logística, 1000 - Operações",
      isGovernanceBase: true,
    },
  });

  const sede = await prisma.location.upsert({
    where: { code: "SEDE-001" },
    update: {},
    create: {
      name: "Sede Administrativa",
      code: "SEDE-001",
      type: "HEADQUARTERS",
      address: "Rua Corporativa, 500 - Centro",
      parentLocationId: cd.id,
    },
  });

  const lojas = await Promise.all(
    [
      ["Loja Centro", "LOJA-001", "Praça Central, 10"],
      ["Loja Norte", "LOJA-002", "Av. Norte, 220"],
      ["Loja Sul", "LOJA-003", "Rua Sul, 330"],
    ].map(([name, code, address]: string[]) =>
      prisma.location.upsert({
        where: { code },
        update: {},
        create: { name, code, address, type: "STORE", parentLocationId: cd.id },
      }),
    ),
  );

  const responsavelLoja = await prisma.person.upsert({
    where: { email: "responsavel.loja@inventariopro.local" },
    update: { locationId: lojas[0].id },
    create: {
      name: "Responsável Loja Centro",
      email: "responsavel.loja@inventariopro.local",
      employeeCode: "LOJA-RESP-001",
      department: "Operações de Loja",
      personType: "STORE_MANAGER",
      locationId: lojas[0].id,
    },
  });

  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { assetTag: "NB-0001" },
      update: {},
      create: {
        assetTag: "NB-0001",
        serialNumber: "SN-NB-0001",
        hostname: "INV-NB-0001",
        type: "NOTEBOOK",
        brand: "Dell",
        model: "Latitude 5440",
        specifications: { cpu: "Intel Core i5", memory: "16GB", storage: "512GB SSD" },
        status: "ASSIGNED",
        currentLocationId: lojas[0].id,
        currentResponsibleId: responsavelLoja.id,
        origin: "PURCHASE",
        createdById: admin.id,
      },
    }),
    prisma.asset.upsert({
      where: { assetTag: "MON-0001" },
      update: {},
      create: {
        assetTag: "MON-0001",
        serialNumber: "SN-MON-0001",
        type: "MONITOR",
        brand: "LG",
        model: "24MK430H",
        specifications: { size: "24", resolution: "Full HD" },
        status: "AVAILABLE",
        currentLocationId: cd.id,
        origin: "PURCHASE",
        createdById: admin.id,
      },
    }),
    prisma.asset.upsert({
      where: { assetTag: "PRT-0001" },
      update: {},
      create: {
        assetTag: "PRT-0001",
        serialNumber: "SN-PRT-0001",
        type: "PRINTER",
        brand: "Brother",
        model: "HL-L6202DW",
        status: "AVAILABLE",
        currentLocationId: sede.id,
        origin: "LEGACY_IMPORT",
        createdById: admin.id,
      },
    }),
  ]);

  await prisma.assetAssignment.upsert({
    where: { id: "seed-assignment-nb-0001" },
    update: {},
    create: {
      id: "seed-assignment-nb-0001",
      assetId: assets[0].id,
      responsibleId: responsavelLoja.id,
      assignedByUserId: admin.id,
      assignmentReason: "Carga inicial de implantação",
    },
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        id: "seed-audit-admin-created",
        entityType: "User",
        entityId: admin.id,
        eventType: "SEED_ADMIN_CREATED",
        actorUserId: admin.id,
        afterPayload: { email: admin.email, role: admin.role },
        metadata: { seed: true },
      },
      ...assets.map((asset: (typeof assets)[number]) => ({
        id: `seed-audit-asset-${asset.assetTag.toLowerCase()}`,
        entityType: "Asset",
        entityId: asset.id,
        eventType: "SEED_ASSET_CREATED",
        actorUserId: admin.id,
        afterPayload: { assetTag: asset.assetTag, status: asset.status },
        metadata: { seed: true },
      })),
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
