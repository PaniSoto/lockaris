import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt, encrypt } from "@/lib/crypto";

// POST: Se usa para recuperar datos sensibles (Password, Tarjeta, CVV,  Notas Seguras)
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const credential = await prisma.credential.findUnique({
      where: { id },
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
        return NextResponse.json(
          { notes: "Error al descifrar nota" },
          { status: 500 },
        );
      }
    }

    // CASO: LOGINS (Por defecto)
    try {
      const password = decrypt(credential.encryptedPassword, credential.iv);
      return NextResponse.json({ password });
    } catch (e) {
      return NextResponse.json(
        { error: "Error al descifrar contraseña" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error global en API POST:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar credenciales
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const deleted = await prisma.credential.deleteMany({
      where: { id: id, userId: session.user.id },
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
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: session.user.id },
    });

    if (!credential)
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    let dataToUpdate = {
      serviceName,
      url: url || null,
    };

    if (type === "CARD") {
      const { cardholderName, cardNumber, expiryDate, cvv } = body;
      dataToUpdate.cardholderName = cardholderName;
      dataToUpdate.expiryDate = expiryDate;
      dataToUpdate.notes = notes || null; // Notas planas en tarjetas

      if (cardNumber && !cardNumber.includes("*")) {
        const cardEnc = encrypt(cardNumber);
        const newIv = cardEnc.iv;
        const cvvEnc = encrypt(cvv || "", newIv);

        dataToUpdate.encryptedCardNumber = cardEnc.encryptedData;
        dataToUpdate.encryptedCvv = cvvEnc.encryptedData;
        dataToUpdate.iv = newIv;
      }
    } else if (type === "NOTE") {
      // Lógica para notas seguras
      // Siempre se re-encripta al guardar para asegurar que use un IV nuevo
      const { iv, encryptedData } = encrypt(notes || "");
      dataToUpdate.notes = encryptedData;
      dataToUpdate.iv = iv;
    } else {
      // Lógica del login
      dataToUpdate.username = body.username;
      dataToUpdate.notes = notes || null; // Notas planas en logins

      if (
        body.password &&
        body.password.trim() !== "" &&
        !body.password.includes("●")
      ) {
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
    return NextResponse.json(
      { message: "Error al actualizar" },
      { status: 500 },
    );
  }
}
