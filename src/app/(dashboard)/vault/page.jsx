"use client";
import { useState, useEffect, useMemo } from "react";
import AddCredentialModal from "@/components/AddCredentialModal";
import PageHeader from "@/components/PageHeader";

import { KeySquare, Search, X, Plus, CreditCard, FileText } from "lucide-react";
import VaultTable from "@/components/vault/VaultTable";

export default function VaultPage() {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de UI
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menú del botón "Nuevo"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // Menú de acciones en la tabla ( ⋮ )

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) setCredentials(await res.json());
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchCredentials();
    
    // Cerrar todos los menús al hacer clic fuera
    const closeAll = () => {
      setIsMenuOpen(false);
      setActiveMenu(null);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return credentials.filter(c => 
      c.serviceName?.toLowerCase().includes(q) || 
      c.username?.toLowerCase().includes(q)
    );
  }, [searchTerm, credentials]);

  const openEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta credencial?")) return;
    const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    if (res.ok) fetchCredentials();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <PageHeader />

        {/* BOTÓN NUEVO CON MENÚ DESPLEGABLE */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Nuevo
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-1 animate-in fade-in zoom-in duration-150">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
              >
                <KeySquare size={18} className="text-blue-500"/>
                <div className="flex flex-col">
                  <span className="font-bold">Inicio de sesión</span>
                </div>
              </button>

              {/* OPCIONES DESHABILITADAS (PARA EL FUTURO) */}
              <button className="w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center gap-3 cursor-not-allowed">
                <CreditCard size={18} />
                <div className="flex flex-col">
                  <span className="font-bold">Tarjeta de pago (Próximamente)</span>
                </div>
              </button>
              
              <button className="w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center gap-3 cursor-not-allowed">
                <FileText size={18} />
                <div className="flex flex-col">
                  <span className="font-bold">Nota segura (Próximamente)</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar en tu bóveda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 py-3.5 pl-12 pr-10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
        <VaultTable
          items={filteredItems} 
          isLoading={isLoading} 
          onEdit={openEdit}
          onDelete={handleDelete}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
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