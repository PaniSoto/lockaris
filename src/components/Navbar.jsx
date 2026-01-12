"use client"
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // Importamos esto

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname(); // Obtenemos la ruta actual

  // Si la ruta es "/login" o "/register", no renderizamos nada
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(pathname)) return null;

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white border-b border-gray-200 shadow-sm">
      <Link href="/" className="text-xl font-bold text-blue-600 tracking-tighter">
        LOCKARIS
      </Link>
      
      <div className="flex gap-6 items-center">
        {session ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Panel
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">{session.user.name}</span>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-100 transition"
              >
                SALIR
              </button>
            </div>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}