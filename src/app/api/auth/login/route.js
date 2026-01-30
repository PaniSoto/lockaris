import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asegúrate de que esta ruta a tu cliente prisma sea correcta
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Buscamos al usuario en PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // 2. Comparamos la contraseña enviada con la encriptada en la DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // 3. Si todo es OK, creamos el JWT
    // El JWT_SECRET debe estar en tu archivo .env
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'clave_secreta_temporal', 
      { expiresIn: '7d' } // El token dura 7 días
    );

    // 4. Devolvemos el token y los datos básicos del usuario
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
