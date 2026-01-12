"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState(""); // Para el mensaje de error en rojo
  const [loading, setLoading] = useState(false); // PUNTO 4: Estado de carga
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiamos errores anteriores

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/login?registered=true");
    } else {
      setError(data.message); // PUNTO 1: Guardamos el error del servidor
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Crear Cuenta en Lockaris</h1>
        
        {/* PUNTO 1: Mensaje de error visual */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm animate-pulse">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input name="email" type="email" required placeholder="ejemplo@correo.com" 
            className="w-full p-2 border rounded-lg focus:ring-2 text-gray-500 focus:ring-blue-500 outline-none transition" />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña (min. 8 caracteres)</label>
          <input name="password" type="password" required placeholder="••••••••" 
            className="w-full p-2 border rounded-lg focus:ring-2 text-gray-500 focus:ring-blue-500 outline-none transition" />
        </div>
        
        {/* PUNTO 4: Botón inteligente con estado de carga */}
        <button 
          disabled={loading}
          className={`w-full p-3 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
        >
          {loading ? "Registrando..." : "Crear Cuenta"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}