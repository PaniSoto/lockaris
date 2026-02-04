import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    let userId = null;

    // 1. Intentar por Sesión (Web)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } 

    // 2. Intentar por Header (Móvil)
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        userId = decoded.userId || decoded.id || decoded.sub;
      }
    }

    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(req) {
  let userId = null;

  try {
    // 1. Intentar por Sesión (Web)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } 

    // 2. Intentar por Header (Móvil)
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          userId = decoded.userId || decoded.id || decoded.sub;
        } catch (jwtError) {
          console.error("Fallo de firma JWT:", jwtError.message);
          return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, email } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name.trim(), 
        email: email.toLowerCase().trim() 
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error real de base de datos:", error.message);
    return NextResponse.json({ error: "Error al actualizar en base de datos" }, { status: 500 });
  }
}