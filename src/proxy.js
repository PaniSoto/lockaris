import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Exportamos la función withAuth directamente como default
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
  matcher: [
    "/vault/:path*", 
    "/tools/:path*", 
    "/settings/:path*"
  ] 
};