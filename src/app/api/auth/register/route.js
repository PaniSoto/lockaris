import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    // Validación de seguridad mínima
    if (password.length < 8) {
      return NextResponse.json({ message: "Mínimo 8 caracteres" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (userExists) {
      return NextResponse.json({ message: "Este correo ya está en uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email: normalizedEmail, password: hashedPassword },
    });

    return NextResponse.json({ message: "Creado" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}