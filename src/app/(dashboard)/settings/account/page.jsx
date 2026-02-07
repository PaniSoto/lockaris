"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import PageHeader from "@/components/PageHeader";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Recibe una URL, realiza la petición HTTP y extrae el cuerpo en formato JSON
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/user/profile", fetcher, {
    revalidateOnFocus: false,
  });

  // Sincronizar estado local al cargar datos
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const formFields = [
    { name: "name", label: "Nombre", type: "text", icon: User },
    { name: "email", label: "Email", type: "email", icon: Mail },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      // MUTATE: Actualiza el caché local de SWR inmediatamente para que el
      // resto de la App vea el nuevo nombre sin recargar.
      await mutate(formData, { revalidate: true });
      toast.success("Perfil actualizado con éxito");
    } catch (error) {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Solo se habilita si hay cambios reales respecto a lo que hay en la DB
  const hasChanges =
    user && (formData.name !== user.name || formData.email !== user.email);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="animate-pulse">Cargando tu configuración...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500">Error al cargar datos.</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <PageHeader />

      <div className="mt-10 max-w-md">
        <form onSubmit={handleSave} className="space-y-6">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                {field.label}
              </label>
              <div className="relative group">
                <field.icon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type={field.type}
                  value={formData[field.name]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-600 font-medium"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-blue-200"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
