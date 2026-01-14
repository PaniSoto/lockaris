import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { message: "El nombre es demasiado corto" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExists) {
      return NextResponse.json(
        { message: "Este correo ya está en uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado con éxito" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
