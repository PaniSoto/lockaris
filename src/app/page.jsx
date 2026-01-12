import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Si el usuario ya tiene sesión, no lo dejamos en la Home, lo mandamos al Dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100-64px)] p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
          Bienvenido a <span className="text-blue-600">Lockaris</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          La plataforma segura para gestionar tus accesos de forma eficiente y sencilla.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Empezar ahora
          </Link>
          <Link 
            href="/register" 
            className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-lg font-bold hover:bg-slate-50 transition"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}