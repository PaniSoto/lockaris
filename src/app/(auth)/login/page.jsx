"use client";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("Correo o contraseña incorrectos");
      } else {
        router.push("/vault");
        router.refresh();
      }
    } catch (err) {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 text-white">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Lockaris
        </h1>
        <p className="text-slate-500 mt-1.5">Accede a tu bóveda segura</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-7 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100"
      >
        {(error || authError) && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 p-3.5 mb-5 rounded-xl text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error || "Error de sesión"}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                name="email"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                className="w-full bg-slate-50 border border-slate-200 py-3 pl-11 pr-4 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 py-3 pl-11 pr-12 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-slate-500 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Regístrate ahora
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
      <Suspense
        fallback={<Loader2 className="animate-spin text-blue-600" size={32} />}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
