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
    let tokenData = null;

    // 1. Intentamos obtener el token de forma estándar (Cookies)
    tokenData = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2. Si falla (Móvil), lo extraemos manualmente del Header y lo decodificamos
    if (!tokenData) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const rawToken = authHeader.split(" ")[1];
        try {
          // 'decode' es la función interna que usa NextAuth para leer sus JWE
          tokenData = await decode({
            token: rawToken,
            secret: process.env.NEXTAUTH_SECRET,
          });
        } catch (err) {
          console.error("Error al decodificar token manual:", err.message);
        }
      }
    }

    if (!tokenData) {
      return NextResponse.json({ error: "No autorizado: Sesión no válida" }, { status: 401 });
    }

    const userId = tokenData.id || tokenData.sub;
    const { name, email } = await req.json();

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
    console.error("ERROR EN PUT PROFILE:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}