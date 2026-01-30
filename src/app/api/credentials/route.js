import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { getServerSession } from "next-auth";

import jwt from "jsonwebtoken";
import { authOptions } from "../auth/[...nextauth]/route";

// Función auxiliar para obtener el ID del usuario (Web o Móvil)
async function getUserId(req) {
  // 1. Intentar por sesión de NextAuth (Web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // 2. Intentar por Token JWT en el Header (Móvil)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId; // El nombre del campo debe coincidir con el que pusiste en el login
    } catch (err) {
      return null;
    }
  }
  return null;
}

// GET: Obtener credenciales
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const credentials = await prisma.credential.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    const processedItems = credentials.map((item) => {
      try {
        if (item.type === "LOGIN" && item.encryptedPassword) {
          return {
            ...item,
            password: decrypt(item.encryptedPassword, item.iv),
          };
        }
        if (item.type === "CARD" && item.encryptedCardNumber) {
          return {
            ...item,
            cardNumber: decrypt(item.encryptedCardNumber, item.iv),
            cvv: item.encryptedCvv ? decrypt(item.encryptedCvv, item.iv) : "",
          };
        }
        if (item.type === "NOTE" && item.notes) {
          return {
            ...item,
            notes: decrypt(item.notes, item.iv),
          };
        }
        return item;
      } catch (error) {
        console.error(`Error al desencriptar item ${item.id}:`, error);
        return { ...item, error: "Error de desencriptación" };
      }
    });

    return NextResponse.json(processedItems);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return NextResponse.json({ message: "Error al obtener datos" }, { status: 500 });
  }
}

// POST: Crear nuevas credenciales
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    if (!serviceName) {
      return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 });
    }

    let dataToSave = {
      type: type || "LOGIN",
      serviceName,
      url: url || null,
      userId: userId, // Usamos el ID recuperado
    };

    if (type === "CARD") {
      const { cardholderName, cardNumber, expiryDate, cvv } = body;
      const { iv, encryptedData: encCard } = encrypt(cardNumber);
      const { encryptedData: encCvv } = encrypt(cvv, iv);

      dataToSave = {
        ...dataToSave,
        cardholderName,
        encryptedCardNumber: encCard,
        encryptedCvv: encCvv,
        expiryDate,
        iv,
        notes: notes || null,
      };
    } else if (type === "NOTE") {
      const { iv, encryptedData } = encrypt(notes || "");
      dataToSave = {
        ...dataToSave,
        notes: encryptedData,
        iv,
      };
    } else {
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json({ message: "Faltan datos de login" }, { status: 400 });
      }
      const { iv, encryptedData } = encrypt(password);
      dataToSave = {
        ...dataToSave,
        username,
        encryptedPassword: encryptedData,
        iv,
        notes: notes || null,
      };
    }

    const nuevaCredencial = await prisma.credential.create({
      data: dataToSave,
    });
    return NextResponse.json(nuevaCredencial, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/credentials:", error);
    return NextResponse.json({ message: "Error al guardar" }, { status: 500 });
  }
}