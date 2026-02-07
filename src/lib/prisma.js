import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Configuración del Pool de conexiones de PostgreSQL.
 * El Pool permite reutilizar conexiones existentes en lugar de crear una nueva
 * por cada consulta, lo que mejora significativamente el rendimiento.
 */
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// Creamos la instancia usando el adaptador
const prisma = global.prisma || new PrismaClient({ adapter });

// Si no estamos en producción, guardamos la instancia en el objeto global
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export { prisma };