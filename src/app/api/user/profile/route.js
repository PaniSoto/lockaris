import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt"; // Herramienta oficial de NextAuth
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

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
    let userId = null;

    // 1. Intentar por Sesión (Web)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("✅ Sesión Web detectada. ID:", userId);
    } 

    // 2. Intentar por Header (Móvil)
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        try {
          // --- BLOQUE DE DIAGNÓSTICO ---
          const decodedPayload = jwt.decode(token); 
          console.log("📦 PAYLOAD DEL TOKEN (sin verificar):", decodedPayload);
          console.log("🔑 USANDO SECRETO:", process.env.NEXTAUTH_SECRET ? "Definido" : "NO DEFINIDO");
          // -----------------------------

          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          userId = decoded.id || decoded.sub || decoded.user?.id;
          
          console.log("✅ Token verificado. ID extraído:", userId);
        } catch (err) {
          console.error("❌ ERROR VALIDANDO JWT MANUAL:", err.message);
          // Si el error es 'invalid signature', el secreto del .env no coincide con el del token
        }
      } else {
        console.warn("⚠️ No se encontró el header Authorization o no es Bearer");
      }
    }

    if (!userId) {
      return NextResponse.json({ 
        error: "Sesión no válida",
        message: "El servidor no pudo identificar al usuario." 
      }, { status: 401 });
    }

    const { name, email } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name?.trim(), 
        email: email?.toLowerCase().trim() 
      },
      select: { id: true, name: true, email: true }
    });

    console.log("✨ Usuario actualizado en DB:", updatedUser.id);
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("ERROR CRÍTICO EN PUT:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}