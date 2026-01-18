"use client";
import { 
  Eye, EyeClosed, CreditCard as CardIcon, Lock, 
  FileText, Copy, Check, Edit3, X, ExternalLink 
} from "lucide-react";
import { useState, useEffect } from "react"; // 1. Importar useEffect

export default function ViewCredentialModal({ isOpen, onClose, data, onEdit }) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // 2. Efecto para resetear la visibilidad cada vez que cambia el item o se cierra/abre
  useEffect(() => {
    if (isOpen) {
      setShowSensitive(false);
    }
  }, [isOpen, data?.id]); // Se dispara cuando el ID de la credencial cambia o el modal se abre

  if (!isOpen || !data) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const DataRow = ({ label, value, fieldName, isSensitive = false, copyValue = null }) => (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
      <div className="flex justify-between items-center">
        <div className="text-gray-700 font-medium break-all">
          {isSensitive && !showSensitive ? (
            <span className="tracking-widest">••••••••••••</span>
          ) : (
            value || "—"
          )}
        </div>
        {(value || copyValue) && (
          <button 
            onClick={() => handleCopy(copyValue || value, fieldName)}
            className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
          >
            {copiedField === fieldName ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${
          data.type === 'CARD' ? 'bg-emerald-600' : data.type === 'NOTE' ? 'bg-amber-600' : 'bg-blue-600'
        }`}>
          <div className="flex items-center gap-3">
            {data.type === "CARD" ? <CardIcon /> : data.type === "NOTE" ? <FileText /> : <Lock />}
            <div>
              <h2 className="text-xl font-bold leading-none">{data.serviceName}</h2>
              <p className="text-xs opacity-80 mt-1 uppercase tracking-wider">
                {data.type === 'LOGIN' ? 'Sesión' : data.type === 'CARD' ? 'Tarjeta' : 'Nota'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {data.type === "LOGIN" && (
              <>
                <DataRow label="Usuario" value={data.username} fieldName="user" />
                <DataRow label="Contraseña" value={data.password} fieldName="pass" isSensitive={true} />
                {data.url && (
                  <div className="py-3">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Sitio Web</p>
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium break-all">
                      {data.url} <ExternalLink size={14} className="shrink-0" />
                    </a>
                  </div>
                )}
              </>
            )}

            {data.type === "CARD" && (
              <>
                <DataRow label="Titular" value={data.cardholderName} fieldName="holder" />
                <DataRow label="Número" value={data.cardNumber} fieldName="card" isSensitive={true} copyValue={data.cardNumber?.replace(/\s/g, '')} />
                <div className="grid grid-cols-2 gap-4">
                  <DataRow label="Expiración" value={data.expiryDate} fieldName="exp" />
                  <DataRow label="CVV" value={data.cvv} fieldName="cvv" isSensitive={true} />
                </div>
              </>
            )}

            {data.type === "NOTE" && (
              <div className="py-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Contenido de la Nota</p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-700 text-sm whitespace-pre-wrap min-h-[100px] max-h-[300px] overflow-y-auto">
                  {showSensitive ? data.notes : "••••••••••••••••••••••••"}
                </div>
                <div className="flex justify-end mt-2">
                   <button onClick={() => handleCopy(data.notes, 'notes')} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:bg-blue-50 p-1.5 rounded">
                     {copiedField === 'notes' ? <Check size={14} /> : <Copy size={14} />} Copiar Nota
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              {showSensitive ? <EyeClosed size={18} /> : <Eye size={18} />}
              {showSensitive ? "Ocultar" : "Revelar"}
            </button>
            <button 
              onClick={() => { onEdit(data); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 shadow-lg transition-all"
            >
              <Edit3 size={18} />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}