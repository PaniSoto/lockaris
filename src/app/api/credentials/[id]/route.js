import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decrypt } from "@/lib/crypto";
import { encrypt } from "@/lib/crypto";

// --- DESCIFRAR PARA EL MODAL ---
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params; // IMPORTANTE: await en Next.js 15

    const credential = await prisma.credential.findFirst({
      where: { 
        id: id, 
        userId: session.user.id 
      }
    });

    if (!credential) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    // Desciframos
    const decryptedPassword = decrypt(credential.encryptedPassword, credential.iv);

    // DEVOLVEMOS UN OBJETO CON LA PROPIEDAD "password"
    return NextResponse.json({ password: decryptedPassword });
  } catch (error) {
    console.error("Error en POST decrypt:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// --- ELIMINAR ---
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    // CORRECCIÓN CRÍTICA: En Next.js 15, params es una promesa. Hay que hacer await.
    const { id } = await params;

    // Usamos deleteMany porque .delete() solo permite filtrar por campos únicos (ID).
    // Al usar deleteMany podemos filtrar por ID + UserID para asegurar que es el dueño.
    const deleted = await prisma.credential.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ message: "No encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// --- EDITAR (ACTUALIZAR) ---
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    // CORRECCIÓN CRÍTICA: Await params aquí también
    const { id } = await params;
    
    const body = await req.json();
    const { serviceName, username, password, url, notes } = body;

    // Verificar que la credencial pertenece al usuario antes de actualizar
    const credential = await prisma.credential.findFirst({
      where: { id: id, userId: session.user.id }
    });

    if (!credential) {
      return NextResponse.json({ message: "No encontrado o no autorizado" }, { status: 404 });
    }

    // Datos a actualizar
    const dataToUpdate = {
      serviceName,
      username,
      url: url || null,
      notes: notes || null,
    };

    // Si hay nueva contraseña, la ciframos
    if (password && password.trim() !== "") {
      const { iv, encryptedData } = encrypt(password);
      dataToUpdate.encryptedPassword = encryptedData;
      dataToUpdate.iv = iv;
    }

    // Actualizamos usando update (ahora seguro porque verificamos ownership arriba)
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