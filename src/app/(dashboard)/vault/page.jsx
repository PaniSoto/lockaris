"use client";
import { useState, useEffect } from "react";
import AddCredentialModal from "@/components/AddCredentialModal";
import PageHeader from "@/components/PageHeader";
import { KeySquare } from "lucide-react";

export default function VaultPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NUEVOS ESTADOS PARA PASO A PASO
  const [activeMenu, setActiveMenu] = useState(null); // ID de la fila con menú abierto
  const [editingItem, setEditingItem] = useState(null);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (error) {
      console.error("Error al cargar credenciales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Cerrar menús al hacer clic en cualquier parte de la pantalla
  useEffect(() => {
    const closeAll = () => setActiveMenu(null);
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta credencial?")) return;
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      if (res.ok) fetchCredentials();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <PageHeader />

        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span>+</span> Nuevo
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3"
              >
                <KeySquare className="text-yellow-400"/>
                <span className="font-semibold">Inicio de sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DISEÑO DE TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Cargando...</td></tr>
            ) : credentials.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs uppercase">
                        {item.serviceName.charAt(0)}
                      </div>
                      {item.serviceName}
                   </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{item.username}</td>
                <td className="px-6 py-4 text-right relative">
                  {/* BOTÓN 3 PUNTOS */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el click cierre el menú al instante
                      setActiveMenu(activeMenu === item.id ? null : item.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 font-bold"
                  >
                    ⋮
                  </button>

                  {/* DESPLEGABLE */}
                  {activeMenu === item.id && (
                    <div className="absolute right-6 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                          setIsModalOpen(true);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLoading && credentials.length === 0 && (
          <div className="p-20 text-center text-gray-400">Bóveda vacía</div>
        )}
      </div>

      <AddCredentialModal 
        isOpen={isModalOpen} 
        initialData={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          fetchCredentials(); 
        }} 
      />
    </div>
  );
}