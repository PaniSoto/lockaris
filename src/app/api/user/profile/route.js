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
  try {
    let userId = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } 

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        // Ajuste: Intentamos todas las variantes de ID que hemos visto
        userId = decoded.userId || decoded.id || decoded.sub;
      }
    }

    // LOG DE CONTROL: Si esto sale como null, el 500 es por el WHERE de Prisma
    console.log("Intentando actualizar usuario ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "No se identificó al usuario" }, { status: 401 });
    }

    const { name, email } = await req.json();

    // Verificación de datos antes de entrar a Prisma
    if (!name || !email) {
       return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId }, // <-- Aquí es donde suele ocurrir el error 500
      data: { 
        name: name.trim(), 
        email: email.toLowerCase().trim() 
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    // ESTE LOG ES VITAL: Míralo en la consola de Vercel o de tu terminal
    console.error("DETALLE DEL ERROR 500 EN PRISMA:", error.message);
    
    return NextResponse.json({ 
      error: "Error al guardar", 
      details: error.message 
    }, { status: 500 });
  }
}