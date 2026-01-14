"use client";
import { Eye, EyeClosed, Shuffle } from "lucide-react";
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

  // Función que genera contraseñas aleatorias
  const handleGeneratePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    // Se actualiza el estado y forzamos que se vea la contraseña generada
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true); 
  };

  useEffect(() => {
    const prepareData = async () => {
      setShowPassword(false);
      
      if (initialData && isOpen) {
        setIsLoadingPassword(true);
        try {
          const res = await fetch(`/api/credentials/${initialData.id}`, { 
            method: 'POST',
            cache: 'no-store' 
          });
          const data = await res.json();

          setFormData({
            serviceName: initialData.serviceName || "",
            username: initialData.username || "",
            password: data.password || "",
            url: initialData.url || "",
            notes: initialData.notes || ""
          });
        } catch (error) {
          console.error("Error al cargar contraseña:", error);
        } finally {
          setIsLoadingPassword(false);
        }
      } else {
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
                className="w-full p-2.5 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Usuario</label>
              <input 
                type="text" placeholder="Correo o usuario"
                className="w-full p-2.5 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                Contraseña
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isLoadingPassword ? "Cargando..." : "********"}
                  className="w-full p-2.5 pr-20 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoadingPassword}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    title="Generar contraseña"
                    className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    <Shuffle className="w-5 h-5"/>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeClosed className="w-5 h-5"/>
                    ) : (
                      <Eye className="w-5 h-5"/>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">URL</label>
              <input 
                type="url" placeholder="https://..."
                className="w-full p-2.5 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notas</label>
              <textarea 
                placeholder="Detalles extra..."
                className="w-full p-2.5 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
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