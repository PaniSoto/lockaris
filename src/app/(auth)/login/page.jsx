"use client"
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react"; // <-- Importamos Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 1. Movemos la lógica del formulario a un componente interno
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- El culpable del error
  
  const authError = searchParams.get("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res.error) {
      setError("Credenciales incorrectas");
      setLoading(false);
    } else {
      router.push("/vault");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 border-t-4 border-blue-600">
      <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">Entrar a Lockaris</h1>
      
      {(error || authError) && (
        <p className="bg-red-100 text-red-700 p-2 mb-4 text-sm rounded">
          {error || "Error al iniciar sesión"}
        </p>
      )}

      <input name="email" type="email" placeholder="Email" required className="w-full text-gray-500 p-2 mb-4 border rounded" />
      <input name="password" type="password" placeholder="Contraseña" required className="w-full text-gray-500 p-2 mb-6 border rounded" />
      
      <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded font-bold disabled:bg-gray-400">
        {loading ? "Cargando..." : "Iniciar Sesión"}
      </button>

      <p className="mt-4 text-gray-600 text-center text-sm">
        ¿No tienes cuenta? <Link href="/register" className="text-blue-600 font-bold hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}

// 2. El componente principal envuelve al formulario en Suspense
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Suspense fallback={<div className="text-gray-500">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}