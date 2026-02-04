import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    let userId;

    // Intentar por Sesión (Web)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } 
    // Intentar por Token (Móvil)
    else if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        // NextAuth guarda el ID en 'id' o en 'sub'
        userId = decoded.id || decoded.sub;
      } catch (err) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, email } = await req.json();

    // Actualización en Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name?.trim(), 
        email: email?.toLowerCase().trim() 
      },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    // Esto te ayudará a ver el error REAL en la consola de tu terminal de VS Code
    console.error("DEBUG ERROR PRISMA:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
