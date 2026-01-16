import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto"; // Añadimos decrypt
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const credentials = await prisma.credential.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // --- PROCESO DE DESENCRIPTACIÓN PARA EL FRONTEND ---
    const decryptedCredentials = credentials.map((item) => {
      try {
        // Usamos los campos iv y encryptedPassword que guardamos en el POST
        const decryptedPassword = decrypt(item.encryptedPassword, item.iv);
        
        return {
          ...item,
          password: decryptedPassword, // Creamos una propiedad 'password' con la clave real
        };
      } catch (error) {
        console.error(`Error al desencriptar item ${item.id}:`, error);
        return { ...item, password: "Error al desencriptar" };
      }
    });

    return NextResponse.json(decryptedCredentials);
  } catch (error) {
    console.error("Error al obtener credenciales:", error);
    return NextResponse.json(
      { message: "Error al obtener datos" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { serviceName, username, password, url, notes } = await req.json();

    if (!serviceName || !username || !password) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Cifro la contraseña
    const { iv, encryptedData } = encrypt(password);

    const nuevaCredencial = await prisma.credential.create({
      data: {
        serviceName,
        username,
        encryptedPassword: encryptedData,
        iv,
        url: url || null,
        notes: notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(nuevaCredencial, { status: 201 });
  } catch (error) {
    console.error("Error en la API de credenciales:", error);
    return NextResponse.json({ message: "Error al guardar" }, { status: 500 });
  }
}