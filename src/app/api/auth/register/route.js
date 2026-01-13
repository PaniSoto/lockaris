import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // 1. Extraemos también el 'name' del JSON
    const { name, email, password } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validaciones básicas
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ message: "El nombre es demasiado corto" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Mínimo 8 caracteres" }, { status: 400 });
    }

    // 3. Comprobar si el usuario ya existe
    const userExists = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });

    if (userExists) {
      return NextResponse.json({ message: "Este correo ya está en uso" }, { status: 400 });
    }

    // 4. Encriptar contraseña y crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: { 
        name: name.trim(), // Guardamos el nombre limpio
        email: normalizedEmail, 
        password: hashedPassword 
      },
    });

    return NextResponse.json({ message: "Usuario creado con éxito" }, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}