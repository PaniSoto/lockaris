import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt, encrypt } from "@/lib/crypto";
import jwt from "jsonwebtoken";

// --- HELPER DE AUTENTICACIÓN ---
async function getUserId(req) {
  // 1. Web: Sesión
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // 2. Móvil: Token Bearer
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
      const decoded = jwt.verify(token, secret);
      // Soporte para diferentes formatos de payload en el JWT
      return decoded.userId || decoded.id || decoded.sub;
    } catch {
      return null;
    }
  }
  return null;
}

// POST: Recuperar datos (Solo lectura segura)
export async function POST(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;

    // SEGURIDAD: Solo busca si coincide el ID y el Usuario
    const credential = await prisma.credential.findFirst({
      where: { id, userId },
    });

    if (!credential) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Lógica de desencriptado para devolver al cliente
    if (credential.type === "CARD") {
      let cardNumber = "";
      let cvv = "";
      try {
        cardNumber = decrypt(credential.encryptedCardNumber, credential.iv);
      } catch (e) { cardNumber = "Error"; }
      
      try {
        cvv = credential.encryptedCvv ? decrypt(credential.encryptedCvv, credential.iv) : "";
      } catch (e) { cvv = "Error"; }

      return NextResponse.json({
        cardNumber,
        cvv,
        cardholderName: credential.cardholderName,
        expiryDate: credential.expiryDate,
      });
    }

    if (credential.type === "NOTE") {
      try {
        const notes = decrypt(credential.notes, credential.iv);
        return NextResponse.json({ notes });
      } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
    }

    // Default: LOGIN
    try {
      const password = decrypt(credential.encryptedPassword, credential.iv);
      return NextResponse.json({ password });
    } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }

  } catch (error) {
    console.error("POST Error:", error.message); // Log genérico, seguro
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Eliminar
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    
    // SEGURIDAD: deleteMany asegura que solo se borre si coincide el userId
    const deleted = await prisma.credential.deleteMany({
      where: { id: id, userId: userId },
    });

    if (deleted.count === 0) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// PUT: Actualizar
export async function PUT(req, { params }) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    // 1. Verificación de propiedad (Critical Security Step)
    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    // 2. Preparar datos (Encriptación fresca)
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
        const newIv = cardEnc.iv; // Importante: Nuevo IV
        const cvvEnc = encrypt(cvv || "", newIv);
        
        dataToUpdate.encryptedCardNumber = cardEnc.encryptedData;
        dataToUpdate.encryptedCvv = cvvEnc.encryptedData;
        dataToUpdate.iv = newIv;
      }
    } else if (type === "NOTE") {
      // Siempre re-encriptamos notas al editar para renovar el IV
      const { iv, encryptedData } = encrypt(notes || "");
      dataToUpdate.notes = encryptedData;
      dataToUpdate.iv = iv;
    } else {
      // Logins
      dataToUpdate.username = body.username;
      dataToUpdate.notes = notes || null;

      if (body.password && body.password.trim() !== "" && !body.password.includes("●")) {
        const { iv, encryptedData } = encrypt(body.password);
        dataToUpdate.encryptedPassword = encryptedData;
        dataToUpdate.iv = iv;
      }
    }

    // 3. Ejecutar actualización
    const updated = await prisma.credential.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Error:", error.message);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}