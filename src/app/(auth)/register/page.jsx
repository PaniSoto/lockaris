"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Configuración dinámica de los campos
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Nombre",
      icon: User,
      placeholder: "Tu nombre o alias",
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      icon: Mail,
      placeholder: "correo@ejemplo.com",
    },
    {
      name: "password",
      type: "password",
      label: "Contraseña Maestra",
      icon: Lock,
      placeholder: "••••••••",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Conversión limpia de FormData a objeto JSON
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");

      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-500">
      <div className="max-w-[400px] w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-xl shadow-blue-200 text-white">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Crea tu cuenta</h2>
          <p className="text-slate-500 mt-2">
            Empieza a proteger tus claves hoy
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 p-4 mb-6 rounded-xl text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  {field.label}
                </label>
                <div className="relative group">
                  <field.icon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    size={20}
                  />
                  <input
                    name={field.name}
                    type={
                      field.type === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field.type
                    }
                    required
                    placeholder={field.placeholder}
                    className={`w-full bg-slate-50 border border-slate-200 py-3 pl-12 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-slate-800 ${
                      field.type === "password" ? "pr-12" : "pr-4"
                    }`}
                  />

                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              name="BtnRegister"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                "Registrarse"
              )}
            </button>
          </form>

          <div className="mt-4 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
