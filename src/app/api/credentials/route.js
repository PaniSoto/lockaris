import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { encrypt } from "@/lib/crypto"; 
// Si usas NextAuth, importa la sesión para saber de quién es la contraseña
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Buscamos todas las credenciales que pertenezcan al ID del usuario logueado
    const credentials = await prisma.credential.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc", // Las más recientes primero
      },
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Error al obtener credenciales:", error);
    return NextResponse.json({ message: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Validar sesión (Seguridad: nadie guarda si no está logueado)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener datos del cuerpo de la petición (lo que viene del formulario)
    const { serviceName, username, password, url, notes } = await req.json();

    // Validar campos obligatorios
    if (!serviceName || !username || !password) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 3. CIFRAR la contraseña usando tu función
    // Según tu archivo: devuelve { iv: ..., encryptedData: ... }
    const { iv, encryptedData } = encrypt(password);

    // 4. GUARDAR en la base de datos con Prisma
    const nuevaCredencial = await prisma.credential.create({
      data: {
        serviceName,
        username,
        encryptedPassword: encryptedData, // Mapeamos el resultado de tu crypto.js
        iv,
        url: url || null,
        notes: notes || null,
        userId: session.user.id, // El ID del usuario que viene de la sesión
      },
    });

    // 5. Responder éxito
    return NextResponse.json(nuevaCredencial, { status: 201 });

  } catch (error) {
    console.error("Error en la API de credenciales:", error);
    return NextResponse.json({ message: "Error al guardar" }, { status: 500 });
  }
}