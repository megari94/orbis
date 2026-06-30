/**
 * Script temporal para borrar un usuario de producción.
 * Uso: node reset-password.mjs <email>
 * Ejemplo: node reset-password.mjs marianelaholsbach@gmail.com
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('@prisma/client');

const [,, email] = process.argv;

if (!email) {
  console.error('Uso: node reset-password.mjs <email>');
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Falta DATABASE_URL.');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ No se encontró usuario con email: ${email}`);
    process.exit(1);
  }

  console.log(`Encontrado: ${user.name} (${user.email}) — tenant: ${user.tenantId}`);

  await prisma.user.delete({ where: { email } });
  console.log(`✅ Usuario ${email} eliminado.`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
