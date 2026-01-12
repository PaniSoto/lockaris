import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si el usuario está autenticado, permitimos que continúe
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Retorna true si existe un token
    },
    pages: {
      signIn: "/login", // Si no está autorizado, redirige aquí
    },
  }
);

// Definimos qué rutas protege el muro
export const config = { 
  matcher: ["/dashboard/:path*"] 
};