import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt, encrypt } from "@/lib/crypto";
import jwt from "jsonwebtoken";

// --- HELPER MEJORADO ---
async function getUserId(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
      const decoded = jwt.verify(token, secret);
      
      // DEBUG: Ver qué trae el token por dentro
      console.log("CONTENIDO DEL TOKEN:", decoded);

      // Busca el ID con diferentes nombres comunes
      return decoded.userId || decoded.id || decoded.sub;
    } catch (e) {
      console.error("Error verificando token:", e.message);
      return null;
    }
  }
  return null;
}

// POST: Recuperar (Mantener igual, pero asegurando userId)
export async function POST(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // ... (Tu lógica de desencriptado de POST aquí se mantiene igual) ...
    // Para abreviar aquí, asumo que mantienes tu lógica de POST original
    // Si la necesitas completa dímelo, pero el error actual es en PUT
     if (credential.type === "CARD") {
        // ... tu logica de tarjeta
        return NextResponse.json({ message: "Datos tarjeta" }); // Placeholder para no borrar tu codigo
     } 
     // ... resto de lógica POST ...
     return NextResponse.json({ message: "OK" });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Eliminar
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const deleted = await prisma.credential.deleteMany({
      where: { id: id, userId: userId },
    });

    if (deleted.count === 0) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// --- PUT: AQUÍ ESTÁ EL DEBUGGING ---
export async function PUT(req, { params }) {
  try {
    const userId = await getUserId(req);
    
    // DEBUG 1: ¿Quién está intentando editar?
    console.log("--- DEBUG PUT ---");
    console.log("Usuario detectado (Token/Session):", userId);

    if (!userId) {
      console.log("Fallo: No hay usuario");
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    console.log("Intentando editar Credencial ID:", id);

    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    // DEBUG 2: Verificamos si existe ANTES de filtrar por usuario para saber qué pasa
    const existeSinUser = await prisma.credential.findUnique({ where: { id } });
    if (existeSinUser) {
        console.log("La credencial existe en DB. Su dueño es:", existeSinUser.userId);
        console.log("¿Coinciden?", existeSinUser.userId === userId ? "SÍ" : "NO");
    } else {
        console.log("La credencial NO existe en DB con ese ID.");
    }

    // Consulta Real
    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) {
      console.log("Resultado: 404 No encontrado (Mismatch de usuario o ID)");
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    let dataToUpdate = {
      serviceName,
      url: url || null,
    };

    if (type === "CARD") {
      const { cardholderName, cardNumber, expiryDate, cvv } = body;
      dataToUpdate.cardholderName = cardholderName;
      dataToUpdate.expiryDate = expiryDate;
      dataToUpdate.notes = notes || null;

      if (cardNumber && !cardNumber.includes("*")) {
        const cardEnc = encrypt(cardNumber);
        const newIv = cardEnc.iv;
        const cvvEnc = encrypt(cvv || "", newIv);
        dataToUpdate.encryptedCardNumber = cardEnc.encryptedData;
        dataToUpdate.encryptedCvv = cvvEnc.encryptedData;
        dataToUpdate.iv = newIv;
      }
    } else if (type === "NOTE") {
      const { iv, encryptedData } = encrypt(notes || "");
      dataToUpdate.notes = encryptedData;
      dataToUpdate.iv = iv;
    } else {
      dataToUpdate.username = body.username;
      dataToUpdate.notes = notes || null;

      if (body.password && body.password.trim() !== "" && !body.password.includes("●")) {
        const { iv, encryptedData } = encrypt(body.password);
        dataToUpdate.encryptedPassword = encryptedData;
        dataToUpdate.iv = iv;
      }
    }

    const updated = await prisma.credential.update({
      where: { id: id },
      data: dataToUpdate,
    });

    console.log("✅ Actualización exitosa");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT_ERROR:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}