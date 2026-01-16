"use client";
import { Eye, EyeClosed, Shuffle, Loader2 } from "lucide-react";
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
  const [isLoadingPass, setIsLoadingPass] = useState(false); // Estado para la carga de edición

  const handleGeneratePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true); 
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      setShowPassword(false);
      
      if (initialData) {
        // MODO EDICIÓN:
        // 1. Cargamos lo que ya tenemos (nombre, user, etc.)
        setFormData({
          serviceName: initialData.serviceName || "",
          username: initialData.username || "",
          password: "", // La dejamos vacía inicialmente
          url: initialData.url || "",
          notes: initialData.notes || ""
        });

        // 2. Pedimos la contraseña al servidor (Seguridad bajo demanda)
        setIsLoadingPass(true);
        try {
          const res = await fetch(`/api/credentials/${initialData.id}`, { method: 'POST' });
          const data = await res.json();
          if (data.password) {
            setFormData(prev => ({ ...prev, password: data.password }));
          }
        } catch (error) {
          console.error("Error al recuperar password para edición:", error);
        } finally {
          setIsLoadingPass(false);
        }
      } else {
        // MODO CREACIÓN
        setFormData({ serviceName: "", username: "", password: "", url: "", notes: "" });
      }
    };

    loadData();
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing ? `/api/credentials/${initialData.id}` : "/api/credentials";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // CAMBIO AQUÍ: Pasa "true" para que el padre sepa que hubo éxito
      if (response.ok) {
        onClose(true); 
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
                type="text" 
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Usuario</label>
              <input 
                type="text"
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Contraseña</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isLoadingPass ? "Cargando..." : "********"}
                  className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoadingPass}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isLoadingPass ? (
                    <Loader2 size={18} className="animate-spin text-gray-400 mr-2" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                      >
                        <Shuffle className="w-5 h-5"/>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeClosed className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Campos de URL y Notas iguales... */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">URL</label>
              <input 
                type="url"
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notas</label>
              <textarea 
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoadingPass}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-colors disabled:bg-blue-400"
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