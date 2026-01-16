import { MoreVertical, Edit, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export default function VaultTable({ items, isLoading, onEdit, onDelete, activeMenu, setActiveMenu }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isFetchingPass, setIsFetchingPass] = useState(null); // Para mostrar carga en el botón

  if (isLoading) return <div className="p-20 text-center text-gray-400">Cargando...</div>;
  if (items.length === 0) return <div className="p-20 text-center text-gray-400">No hay elementos.</div>;

  // NUEVA FUNCIÓN: Obtiene la clave del servidor solo cuando se necesita
  const handleCopyPassword = async (id) => {
    setIsFetchingPass(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: 'POST' });
      const data = await res.json();

      if (data.password) {
        await navigator.clipboard.writeText(data.password);
        setCopiedId(`pass-${id}`);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Error al obtener la clave:", err);
      alert("Error de seguridad al recuperar la contraseña.");
    } finally {
      setIsFetchingPass(null);
    }
  };

  const handleCopyUser = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(`user-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <table className="w-full text-left">
      {/* ... (Thead igual) ... */}
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-semibold text-gray-900">{item.serviceName}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{item.username}</td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === item.id ? null : item.id);
                }}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400"
              >
                <MoreVertical size={18} />
              </button>

              {activeMenu === item.id && (
                <div className="absolute right-6 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-left">
                  {/* COPIAR USUARIO (Dato no sensible, se copia directo) */}
                  <button 
                    onClick={() => handleCopyUser(item.username, item.id)}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><Copy size={14}/> Copiar usuario</span>
                    {copiedId === `user-${item.id}` && <Check size={14} className="text-green-500" />}
                  </button>

                  {/* COPIAR CONTRASEÑA (Carga bajo demanda) */}
                  <button 
                    onClick={() => handleCopyPassword(item.id)}
                    disabled={isFetchingPass === item.id}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      {isFetchingPass === item.id ? <Loader2 size={14} className="animate-spin"/> : <Copy size={14}/>}
                      Copiar clave
                    </span>
                    {copiedId === `pass-${item.id}` && <Check size={14} className="text-green-500" />}
                  </button>

                  <button onClick={() => onEdit(item)} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit size={14} /> Editar
                  </button>
                  <button onClick={(e) => onDelete(e, item.id)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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