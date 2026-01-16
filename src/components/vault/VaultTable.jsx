import { MoreVertical, Edit, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function VaultTable({ items, isLoading, onEdit, onDelete, activeMenu, setActiveMenu }) {
  const [copiedId, setCopiedId] = useState(null);

  if (isLoading) return <div className="p-20 text-center text-gray-400">Cargando...</div>;
  if (items.length === 0) return <div className="p-20 text-center text-gray-400">No hay elementos.</div>;

  // Función simplificada: Solo copia y muestra feedback visual
  const handleCopy = async (text, type, id) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      
      // Feedback visual (Check verde)
      setCopiedId(`${type}-${id}`);
      
      // Quitar el check a los 2 segundos
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("No se pudo acceder al portapapeles.");
    }
  };

  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold">
        <tr>
          <th className="px-6 py-4">Servicio</th>
          <th className="px-6 py-4">Usuario</th>
          <th className="px-6 py-4 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold uppercase">
                  {item.serviceName.charAt(0)}
                </div>
                <span className="font-semibold text-gray-900">{item.serviceName}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-gray-600 text-sm">{item.username}</td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === item.id ? null : item.id);
                }}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {activeMenu === item.id && (
                <div className="absolute right-6 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden text-left">
                  {/* COPIAR USUARIO */}
                  <button 
                    onClick={() => handleCopy(item.username, 'user', item.id)}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><Copy size={14}/> Copiar usuario</span>
                    {copiedId === `user-${item.id}` && <Check size={14} className="text-green-500" />}
                  </button>

                  {/* COPIAR CONTRASEÑA */}
                  <button 
                    onClick={() => handleCopy(item.password, 'pass', item.id)}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="flex items-center gap-2"><Copy size={14}/> Copiar contraseña</span>
                    {copiedId === `pass-${item.id}` && <Check size={14} className="text-green-500" />}
                  </button>

                  {/* EDITAR */}
                  <button 
                    onClick={() => onEdit(item)}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 mt-1"
                  >
                    <Edit size={14} /> Editar
                  </button>

                  {/* ELIMINAR */}
                  <button 
                    onClick={(e) => onDelete(e, item.id)}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}