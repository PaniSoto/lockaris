import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt"; // Herramienta oficial de NextAuth

export async function GET(req) {
  try {
    // Usamos getToken para que funcione tanto con Cookies (Web) como con Bearer (Móvil)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = token.id || token.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    // getToken es la clave: busca automáticamente el token en el header Authorization
    // y lo desencripta usando tu NEXTAUTH_SECRET.
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      console.log("Token no detectado en el servidor");
      return NextResponse.json({ error: "Token inválido o no proporcionado" }, { status: 401 });
    }

    const userId = token.id || token.sub;

    const { name, email } = await req.json();

    // 1. Validar que los datos no vengan vacíos
    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    // 2. Actualizar el usuario en Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name.trim(), 
        email: email.toLowerCase().trim() 
      },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("DEBUG ERROR PRISMA:", error);
    
    // Si el error es por email duplicado (Prisma P2002)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}