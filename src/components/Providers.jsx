"use client";
import { SessionProvider } from "next-auth/react";

// Componente que envuelve la aplicación para proporcionar el contexto de sesión
export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
