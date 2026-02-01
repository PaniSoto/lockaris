import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt, encrypt } from "@/lib/crypto";
import jwt from "jsonwebtoken"; // <--- 1. IMPORTANTE: Necesario para leer el token del móvil

// --- 2. FUNCIÓN MAESTRA: Detecta si es Web (Session) o Móvil (Token) ---
async function getUserId(req) {
  // A) Intento Web (Cookies)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  // B) Intento Móvil (Header Authorization)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
      const decoded = jwt.verify(token, secret);
      // Devuelve el ID. A veces se guarda como 'userId', a veces como 'id' o 'sub'
      return decoded.userId || decoded.id || decoded.sub;
    } catch (e) {
      console.error("Error verificando token móvil:", e.message);
      return null;
    }
  }
  return null;
}

// POST: Recuperar datos sensibles
export async function POST(request, { params }) {
  try {
    // 3. SEGURIDAD: Ahora verificamos usuario también aquí
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;

    // Usamos findFirst para asegurar que el ID pertenece al usuario
    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId },
    });

    if (!credential) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // CASO: TARJETAS
    if (credential.type === "CARD") {
      let cardNumber = "";
      let cvv = "";

      try {
        cardNumber = decrypt(credential.encryptedCardNumber, credential.iv);
      } catch (e) {
        cardNumber = "Error al descifrar número";
      }

      try {
        cvv = credential.encryptedCvv
          ? decrypt(credential.encryptedCvv, credential.iv)
          : "";
      } catch (e) {
        cvv = "???";
      }

      return NextResponse.json({
        cardNumber,
        cvv,
        cardholderName: credential.cardholderName,
        expiryDate: credential.expiryDate,
      });
    }

    // CASO: NOTAS SEGURAS
    if (credential.type === "NOTE") {
      try {
        const decryptedNotes = decrypt(credential.notes, credential.iv);
        return NextResponse.json({ notes: decryptedNotes });
      } catch (e) {
        return NextResponse.json({ notes: "Error al descifrar" }, { status: 500 });
      }
    }

    // CASO: LOGINS (Por defecto)
    try {
      const password = decrypt(credential.encryptedPassword, credential.iv);
      return NextResponse.json({ password });
    } catch (e) {
      return NextResponse.json({ error: "Error contraseña" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error POST:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Eliminar credenciales
export async function DELETE(req, { params }) {
  try {
    // 4. CAMBIO: Usamos getUserId
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const deleted = await prisma.credential.deleteMany({
      where: { id: id, userId: userId }, // Seguridad: solo borra si es suyo
    });

    if (deleted.count === 0) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// PUT: Actualizar las credenciales
export async function PUT(req, { params }) {
  try {
    // 5. CAMBIO: Usamos getUserId
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: userId }, // Seguridad: solo edita si es suyo
    });

    if (!credential)
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    let dataToUpdate = {
      serviceName,
      url: url || null,
    };

    // Lógica de encriptación (INTACTA)
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
    console.error("PUT_ERROR:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}