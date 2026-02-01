import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt, encrypt } from "@/lib/crypto";
import jwt from "jsonwebtoken";

// Función para obtener el ID del usuario (Web o Móvil)
async function getUserId(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
      const decoded = jwt.verify(token, secret);
      return decoded.userId || decoded.id || decoded.sub;
    } catch { return null; }
  }
  return null;
}

// POST: Recuperar datos sensibles
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    if (credential.type === "CARD") {
      return NextResponse.json({
        cardNumber: decrypt(credential.encryptedCardNumber, credential.iv),
        cvv: credential.encryptedCvv ? decrypt(credential.encryptedCvv, credential.iv) : "",
        cardholderName: credential.cardholderName,
        expiryDate: credential.expiryDate,
      });
    }

    if (credential.type === "NOTE") {
      return NextResponse.json({ notes: decrypt(credential.notes, credential.iv) });
    }

    return NextResponse.json({ password: decrypt(credential.encryptedPassword, credential.iv) });
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

// PUT: Actualizar
export async function PUT(req, { params }) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    let dataToUpdate = { serviceName, url: url || null };

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

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}