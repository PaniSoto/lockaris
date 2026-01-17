"use client";
import { MoreVertical, Edit, Trash2, CreditCard, FileText, KeySquare, ChevronRight, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export default function VaultTable({ items, isLoading, onEdit, onDelete, activeMenu, setActiveMenu }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isFetchingSensitive, setIsFetchingSensitive] = useState(null);

  // Manejador para copiar datos (Password, CVV o Notas)
  const handleCopySensitive = async (e, id, type, fieldToCopy) => {
    e.stopPropagation(); // Evita que se abra el modal
    setIsFetchingSensitive(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: 'POST' });
      const data = await res.json();

      let textToCopy = "";
      if (type === "CARD") {
        textToCopy = fieldToCopy === "cvv" ? data.cvv : data.cardNumber;
      } else if (type === "NOTE") {
        textToCopy = data.notes;
      } else {
        textToCopy = data.password;
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedId(`${fieldToCopy}-${id}`);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Error al obtener datos:", err);
    } finally {
      setIsFetchingSensitive(null);
    }
  };

  const handleCopySimple = (e, text, id, fieldName) => {
    e.stopPropagation(); // Evita que se abra el modal
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${fieldName}-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 animate-pulse flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="z-index">
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onEdit(item)} 
            className="group flex items-center justify-between p-4 hover:bg-blue-50/50 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-500"
          >
            {/* IZQUIERDA: ICONO Y TEXTOS */}
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm border ${
                item.type === 'CARD' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                item.type === 'NOTE' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                {item.type === 'CARD' ? <CreditCard size={22}/> : 
                 item.type === 'NOTE' ? <FileText size={22}/> : 
                 <KeySquare size={22}/>}
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                  {item.serviceName}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {item.type === 'CARD' ? 'Tarjeta de pago' : 
                   item.type === 'NOTE' ? 'Nota Segura' : 'Inicio de sesión'}
                  {item.username && <span className="lowercase text-gray-300"> • {item.username}</span>}
                </span>
              </div>
            </div>

            {/* DERECHA: ICONO DE ESTADO Y TRES PUNTOS */}
            <div className="flex items-center gap-2">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                <ChevronRight size={18} className="text-gray-300" />
              </div>
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === item.id ? null : item.id);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {activeMenu === item.id && (
                  <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-100">
                    
                    {/* OPCIONES SEGÚN TIPO */}
                    {item.type === "CARD" ? (
                      <>
                        <button onClick={(e) => handleCopySensitive(e, item.id, "CARD", "cardNumber")} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                          <span className="flex items-center gap-2"><Copy size={14}/> Copiar número</span>
                          {copiedId === `cardNumber-${item.id}` && <Check size={14} className="text-green-500" />}
                        </button>
                        <button onClick={(e) => handleCopySensitive(e, item.id, "CARD", "cvv")} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100">
                          <span className="flex items-center gap-2">
                             {isFetchingSensitive === item.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14}/>} 
                             Copiar CVV
                          </span>
                          {copiedId === `cvv-${item.id}` && <Check size={14} className="text-green-500" />}
                        </button>
                      </>
                    ) : item.type === "NOTE" ? (
                      <button onClick={(e) => handleCopySensitive(e, item.id, "NOTE", "notes")} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100">
                        <span className="flex items-center gap-2">
                          {isFetchingSensitive === item.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14}/>} 
                          Copiar nota
                        </span>
                        {copiedId === `notes-${item.id}` && <Check size={14} className="text-green-500" />}
                      </button>
                    ) : (
                      <>
                        <button onClick={(e) => handleCopySimple(e, item.username, item.id, "user")} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                          <span className="flex items-center gap-2"><Copy size={14}/> Copiar usuario</span>
                          {copiedId === `user-${item.id}` && <Check size={14} className="text-green-500" />}
                        </button>
                        <button onClick={(e) => handleCopySensitive(e, item.id, "LOGIN", "password")} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100">
                          <span className="flex items-center gap-2">
                             {isFetchingSensitive === item.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14}/>} 
                             Copiar clave
                          </span>
                          {copiedId === `password-${item.id}` && <Check size={14} className="text-green-500" />}
                        </button>
                      </>
                    )}

                    {/* ACCIONES COMUNES */}
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 mt-1">
                      <Edit size={14} className="text-blue-500" /> Editar detalles
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(e, item.id); }} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}