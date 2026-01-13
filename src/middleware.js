// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = { 
  // Aquí agrupamos todas las rutas que requieren sesión
  matcher: [
    "/vault/:path*", 
    "/tools/:path*", 
    "/settings/:path*"
  ] 
};