"use client";
import { useState, useEffect } from "react";

export default function AddCredentialModal({ isOpen, onClose, initialData = null }) {
  const [formData, setFormData] = useState({
    serviceName: "",
    username: "",
    password: "",
    url: "",
    notes: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    const prepareData = async () => {
      setShowPassword(false);
      
      if (initialData && isOpen) {
        setIsLoadingPassword(true);
        try {
          // Llamamos al endpoint POST que creamos para descifrar la contraseña
          const res = await fetch(`/api/credentials/${initialData.id}`, { 
            method: 'POST',
            cache: 'no-store' 
          });
          const data = await res.json();

          setFormData({
            serviceName: initialData.serviceName || "",
            username: initialData.username || "",
            password: data.password || "", // Cargamos la contraseña real descifrada
            url: initialData.url || "",
            notes: initialData.notes || ""
          });
        } catch (error) {
          console.error("Error al cargar contraseña:", error);
        } finally {
          setIsLoadingPassword(false);
        }
      } else {
        // Reset para nueva credencial
        setFormData({
          serviceName: "",
          username: "",
          password: "",
          url: "",
          notes: ""
        });
      }
    };

    prepareData();
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing 
      ? `/api/credentials/${initialData.id}` 
      : "/api/credentials";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose();
      } else {
        console.error("Error en la petición");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? "Editar Credencial" : "Nuevo Inicio de Sesión"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Servicio</label>
              <input 
                type="text" placeholder="Ej: Netflix, Google..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Usuario</label>
              <input 
                type="text" placeholder="Correo o usuario"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isLoadingPassword ? "Cargando..." : "********"}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoadingPassword}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">URL</label>
              <input 
                type="url" placeholder="https://..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notas</label>
              <textarea 
                placeholder="Detalles extra..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-2.5 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-colors disabled:bg-blue-400"
                disabled={isLoadingPassword}
              >
                {initialData ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}