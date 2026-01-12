// lib/data.js o services/user.js
import { prisma } from "./prisma";

// Buscar un usuario por email (útil para el Login de mañana)
export async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

// Obtener el ID del usuario desde la sesión
export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}