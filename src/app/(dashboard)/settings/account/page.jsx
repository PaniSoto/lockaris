"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import PageHeader from "@/components/PageHeader";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Función fetcher para SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Usamos SWR para manejar la carga y caché
  const { data: user, error, isLoading, mutate } = useSWR("/api/user/profile", fetcher, {
    revalidateOnFocus: false, // Evita que el cursor salte si cambias de pestaña
  });

  // 2. Sincronizamos el estado local cuando SWR recibe datos
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  // 3. Lógica de Guardado
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", { // Usamos la misma ruta con PUT
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Perfil actualizado");
        // 'mutate' actualiza la caché de SWR con los nuevos datos sin recargar
        mutate(formData); 
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  // Comparar si hay cambios reales para habilitar el botón
  const hasChanges = user && (formData.name !== user.name || formData.email !== user.email);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">Error al cargar datos.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <PageHeader />

      <div className="max-w-md mt-10">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Nombre</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border text-gray-500 border-gray-200 py-3.5 pl-12 pr-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border text-gray-500 border-gray-200 py-3.5 pl-12 pr-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}