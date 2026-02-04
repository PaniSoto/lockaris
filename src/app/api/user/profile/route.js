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
    // 1. Intentar obtener sesión (Funciona para Web)
    let session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 2. Si no hay sesión (Móvil), intentamos leer el Token del header
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.split(' ')[1];

      if (token) {
        // Verificamos el token manualmente con el secreto que tienes en .env
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        userId = decoded.id || decoded.sub; // NextAuth a veces usa 'sub' como ID
      }
    }

    // 3. Si después de ambos intentos no hay ID, bloqueamos
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, email } = await req.json();

    // 4. Actualización en Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name?.trim(), 
        email: email?.toLowerCase().trim() 
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error en PUT /api/user/profile:", error);
    return NextResponse.json({ error: "Error al guardar los cambios" }, { status: 500 });
  }
}
