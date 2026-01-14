import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from "@/lib/crypto";
import { encrypt } from "@/lib/crypto";

// Se encarga de descifrar y devolver la contraseña de una credencial en específico
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const credential = await prisma.credential.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!credential)
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    const decryptedPassword = decrypt(
      credential.encryptedPassword,
      credential.iv
    );

    // Se devuelve la contraseña descifrada
    return NextResponse.json({ password: decryptedPassword });
  } catch (error) {
    console.error("Error en POST decrypt:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;

    // Se usa deleteMany porque delete() solo permite filtrar por campos únicos.
    const deleted = await prisma.credential.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { message: "No encontrado o no autorizado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const body = await req.json();
    const { serviceName, username, password, url, notes } = body;

    // Primero se verifica que la credencial pertenece al usuario antes de actualizar
    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: session.user.id },
    });

    if (!credential) {
      return NextResponse.json(
        { message: "No encontrado o no autorizado" },
        { status: 404 }
      );
    }

    const dataToUpdate = {
      serviceName,
      username,
      url: url || null,
      notes: notes || null,
    };

    // Si hay nueva contraseña, se cifra
    if (password && password.trim() !== "") {
      const { iv, encryptedData } = encrypt(password);
      dataToUpdate.encryptedPassword = encryptedData;
      dataToUpdate.iv = iv;
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
      { status: 500 }
    );
  }
}
