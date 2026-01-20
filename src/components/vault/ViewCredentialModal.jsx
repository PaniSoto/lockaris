"use client";
import {
  Eye,
  EyeClosed,
  CreditCard as CardIcon,
  Lock,
  FileText,
  Copy,
  Check,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ViewCredentialModal({ isOpen, onClose, data, onEdit }) {
  // Estados para controlar la visibilidad de campos individuales, igual que en el modal de añadir
  const [showPassword, setShowPassword] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Se resetean los estados al abrir
  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setShowCardNumber(false);
      setShowCvv(false);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const type = data.type;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {type === "CARD" ? (
                <CardIcon className="text-emerald-500" />
              ) : type === "NOTE" ? (
                <FileText className="text-amber-500" />
              ) : (
                <Lock className="text-blue-500" />
              )}
              Detalles de{" "}
              {type === "CARD"
                ? "Tarjeta"
                : type === "NOTE"
                  ? "Nota Segura"
                  : "Inicio de Sesión"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                {type === "CARD"
                  ? "Banco / Nombre Tarjeta"
                  : type === "NOTE"
                    ? "Título de la Nota"
                    : "Servicio"}
              </label>
              <input
                type="text"
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                value={data.serviceName || ""}
                readOnly
              />
            </div>

            {type === "NOTE" ? (
              <div className="relative group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Contenido de la Nota Segura
                </label>
                <textarea
                  className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none h-64 resize-none"
                  value={data.notes || ""}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => handleCopy(data.notes, "notes")}
                  className="absolute bottom-3 right-3 p-2 bg-white shadow-sm border rounded-md text-gray-500 hover:text-amber-600 transition-colors"
                >
                  {copiedField === "notes" ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            ) : (
              <>
                {type === "LOGIN" ? (
                  <>
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Usuario
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 pr-10 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                        value={data.username || ""}
                        readOnly
                      />
                      <button
                        onClick={() => handleCopy(data.username, "user")}
                        className="absolute right-3 top-8 text-gray-400 hover:text-blue-500"
                      >
                        {copiedField === "user" ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Contraseña
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                          value={data.password || ""}
                          readOnly
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(data.password, "pass")}
                            className="p-1.5 text-gray-400 hover:text-blue-500"
                          >
                            {copiedField === "pass" ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1.5 text-gray-400 hover:text-blue-600"
                          >
                            {showPassword ? (
                              <EyeClosed size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Titular
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none uppercase"
                        value={data.cardholderName || ""}
                        readOnly
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Número de Tarjeta
                      </label>
                      <input
                        type={showCardNumber ? "text" : "password"}
                        className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                        value={data.cardNumber || ""}
                        readOnly
                      />
                      <div className="absolute right-2 top-8 flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleCopy(
                              data.cardNumber?.replace(/\s/g, ""),
                              "card",
                            )
                          }
                          className="p-1.5 text-gray-400 hover:text-emerald-500"
                        >
                          {copiedField === "card" ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => setShowCardNumber(!showCardNumber)}
                          className="p-1.5 text-gray-400"
                        >
                          {showCardNumber ? (
                            <EyeClosed size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                          Expiración
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                          value={data.expiryDate || ""}
                          readOnly
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                          CVV
                        </label>
                        <input
                          type={showCvv ? "text" : "password"}
                          className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none"
                          value={data.cvv || ""}
                          readOnly
                        />
                        <div className="absolute right-2 top-8 flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(data.cvv, "cvv")}
                            className="p-1.5 text-gray-400 hover:text-emerald-500"
                          >
                            {copiedField === "cvv" ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => setShowCvv(!showCvv)}
                            className="p-1.5 text-gray-400"
                          >
                            {showCvv ? (
                              <EyeClosed size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* Campo de notas para el login y Card */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Notas adicionales
                  </label>
                  <textarea
                    className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg bg-gray-50 outline-none h-20 resize-none"
                    value={data.notes || ""}
                    readOnly
                  />
                </div>
              </>
            )}

            {/* Acciones del modal de visualización */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onEdit(data);
                  onClose();
                }}
                className={`flex-1 text-white py-2.5 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 ${
                  type === "CARD"
                    ? "bg-emerald-600"
                    : type === "NOTE"
                      ? "bg-amber-600"
                      : "bg-blue-600"
                }`}
              >
                <Edit3 size={18} />
                Editar Datos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
