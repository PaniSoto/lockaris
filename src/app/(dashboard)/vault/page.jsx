"use client";
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import AddCredentialModal from "@/components/AddCredentialModal";
// Importamos el nuevo modal (asegúrate de crearlo con el código que te pasé antes)

import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

import { KeySquare, Search, X, Plus, CreditCard, FileText } from "lucide-react";
import VaultTable from "@/components/vault/VaultTable";
import ViewCredentialModal from "@/components/vault/ViewCredentialModal";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function VaultPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de Edición
  const [isViewOpen, setIsViewOpen] = useState(false);   // NUEVO: Modal de Vista
  const [selectedItem, setSelectedItem] = useState(null); // Item seleccionado para ver/editar
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalType, setModalType] = useState("LOGIN");

  const {
    data: credentials = [],
    mutate,
    isLoading,
  } = useSWR("/api/credentials", fetcher);

  useEffect(() => {
    const closeAll = () => {
      setIsMenuOpen(false);
      setActiveMenu(null);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (q.length < 2) return credentials;
    return credentials.filter(
      (c) =>
        c.serviceName?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q)
    );
  }, [searchTerm, credentials]);

  // Función cuando clicas en la fila (Ahora abre VISTA)
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
    setActiveMenu(null);
  };

  // Función para abrir el modal de EDICIÓN (desde el menú o desde el botón editar del modal vista)
  const openEdit = (item) => {
    setSelectedItem(item);
    setModalType(item.type || "LOGIN");
    setIsModalOpen(true);
    setIsViewOpen(false); // Cerramos el de vista por si acaso viene de ahí
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta credencial?")) return;

    const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutate();
      toast.error("Credencial eliminada");
    } else {
      toast.warning("No se pudo eliminar la credencial");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <PageHeader />

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Nuevo
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-1 animate-in fade-in zoom-in duration-150">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType("LOGIN");
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
              >
                <KeySquare size={18} className="text-blue-500" />
                Inicio de sesión
              </button>
              {/* ... otros botones del menú ... */}
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType("CARD");
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
              >
                <CreditCard size={18} className="text-emerald-500" /> Tarjeta de pago
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType("NOTE");
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
              >
                <FileText size={18} className="text-amber-500" /> Nota segura
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
          placeholder="Buscar (mínimo 2 letras)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 py-3.5 pl-12 pr-10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
        <VaultTable
          items={filteredItems}
          isLoading={isLoading}
          onEdit={handleViewItem} // <-- CAMBIO: Ahora al clicar, va a handleViewItem
          onDelete={handleDelete}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      {/* NUEVO MODAL: VISTA DE DATOS */}
      <ViewCredentialModal
        isOpen={isViewOpen}
        data={selectedItem}
        onClose={() => setIsViewOpen(false)}
        onEdit={openEdit} // Pasa la función para abrir el editor
      />

      {/* MODAL EXISTENTE: AGREGAR / EDITAR */}
      <AddCredentialModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        type={modalType}
        onClose={(success) => {
          setIsModalOpen(false);
          if (success === true) {
            mutate();
            toast.success(selectedItem ? "Actualizado correctamente" : "Guardado correctamente");
          }
          setSelectedItem(null);
        }}
      />
    </div>
  );
}