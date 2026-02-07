"use client";
import {
  Eye,
  EyeClosed,
  Shuffle,
  Loader2,
  CreditCard as CardIcon,
  Lock,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Modal para crear y editar las credenciales.
 * Soporta los tipos: LOGIN, CARD y NOTE.
 */
export default function AddCredentialModal({
  isOpen,
  onClose,
  initialData = null,
  type = "LOGIN",
}) {
  // Estado único para el formulario para facilitar la actualización masiva
  const [formData, setFormData] = useState({
    serviceName: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Estados para mostrar/ocultar datos sensibles
  const [showPassword, setShowPassword] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [isLoadingPass, setIsLoadingPass] = useState(false);

  // Estado para el feedback visual de copiado
  const [copiedField, setCopiedField] = useState(null);

  //Maneja el copiado al portapapeles
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Formatea el número de tarjeta en grupos de 4 dígitos para mejorar la lectura
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(" ");
    return v;
  };

  // Para generar una contraseña aleatoria
  const handleGeneratePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true); // Mostrar para que el usuario vea qué se generó
  };

  /**
   * Si es edición, recupera los datos sensibles (desencriptados) del servidor
   * Si es creación, se resetea el formulario
   */
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      setShowPassword(false);
      setShowCardNumber(false);
      setShowCvv(false);

      // Si hay datos iniciales, es edición
      if (initialData) {
        setFormData({
          serviceName: initialData.serviceName || "",
          username: initialData.username || "",
          password: "",
          url: initialData.url || "",
          notes: initialData.notes || "",
          cardholderName: initialData.cardholderName || "",
          cardNumber: "",
          expiryDate: initialData.expiryDate || "",
          cvv: "",
        });

        setIsLoadingPass(true);
        try {
          // Llamada al endpoint para obtener datos sensibles desencriptados
          const res = await fetch(`/api/credentials/${initialData.id}`, {
            method: "POST",
          });
          const data = await res.json();

          // Lógica para llenar campos según el tipo de credencial
          if (initialData.type === "CARD") {
            setFormData((prev) => ({
              ...prev,
              cardNumber: data.cardNumber || "",
              cvv: data.cvv || "",
              cardholderName: data.cardholderName || prev.cardholderName,
              expiryDate: data.expiryDate || prev.expiryDate,
              notes: data.notes || prev.notes,
            }));
          } else if (initialData.type === "NOTE") {
            setFormData((prev) => ({ ...prev, notes: data.notes || "" }));
          } else {
            if (data.password) {
              setFormData((prev) => ({
                ...prev,
                password: data.password,
                notes: data.notes || prev.notes,
              }));
            }
          }
        } catch (error) {
          console.error("Error al recuperar datos:", error);
        } finally {
          setIsLoadingPass(false);
        }
      } else {
        // Se limpia el formulario para la nueva entrada
        setFormData({
          serviceName: "",
          username: "",
          password: "",
          url: "",
          notes: "",
          cardholderName: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
        });
      }
    };
    loadData();
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Envia los datos al servidor (POST para crear, PUT para actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoadingPass) return;

    const isEditing = !!initialData;
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing
      ? `/api/credentials/${initialData.id}`
      : "/api/credentials";

    try {
      setIsLoadingPass(true);

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type }),
      });

      if (response.ok) {
        setIsLoadingPass(false); // Reseteamos antes de cerrar
        onClose(true);
      } else {
        setIsLoadingPass(false);
        const errorData = await response.json();
        alert(errorData.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setIsLoadingPass(false);
      alert("Error de conexión. Inténtalo de nuevo.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()} // Cerrar al hacer clic fuera
    >
      {/* Contenedor modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Cabecera dinámica dependiendo del tipo */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {type === "CARD" ? (
                <CardIcon className="text-emerald-500" />
              ) : type === "NOTE" ? (
                <FileText className="text-amber-500" />
              ) : (
                <Lock className="text-blue-500" />
              )}
              {initialData
                ? "Editar"
                : type === "CARD" || type === "NOTE"
                  ? "Nueva"
                  : "Nuevo"}
              {type === "CARD"
                ? " Tarjeta"
                : type === "NOTE"
                  ? " Nota Segura"
                  : " Inicio de Sesión"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de título / Nombre del servicio */}
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
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                required
              />
            </div>

            {/* Renderizado condicional según el tipo */}
            {type === "NOTE" ? (
              /* Vista de nota segura */
              <div className="relative group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Contenido de la Nota Segura
                </label>
                <textarea
                  className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-64 resize-none"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isLoadingPass}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(formData.notes, "notes")}
                  className="absolute bottom-3 right-3 p-2 bg-white/80 backdrop-blur shadow-sm border rounded-md text-gray-500 hover:text-amber-600 transition-colors"
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
                  /* Vista de inicio de sesión */
                  <>
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Usuario
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 pr-10 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(formData.username, "user")}
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
                          className="w-full p-2.5 pr-24 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required={!initialData}
                          disabled={isLoadingPass}
                        />
                        {/* Acciones de Contraseña: Copiar, Generar y Ver */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {!isLoadingPass && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(formData.password, "pass")
                                }
                                className="p-1.5 text-gray-400 hover:text-blue-500"
                              >
                                {copiedField === "pass" ? (
                                  <Check size={18} className="text-green-500" />
                                ) : (
                                  <Copy size={18} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                                title="Generar contraseña"
                              >
                                <Shuffle className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1.5 text-gray-400 hover:text-blue-600"
                              >
                                {showPassword ? (
                                  <EyeClosed className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Vista de tarjeta */
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Titular
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                        value={formData.cardholderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardholderName: e.target.value.toUpperCase(),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                        Número de Tarjeta
                      </label>
                      <input
                        type={showCardNumber ? "text" : "password"}
                        maxLength="19"
                        className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        required
                      />
                      <div className="absolute right-2 top-8 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              formData.cardNumber.replace(/\s/g, ""),
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
                          type="button"
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
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "");
                            if (v.length > 2)
                              v = v.substring(0, 2) + "/" + v.substring(2, 4);
                            setFormData({ ...formData, expiryDate: v });
                          }}
                          required
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                          CVV
                        </label>
                        <input
                          type={showCvv ? "text" : "password"}
                          maxLength="4"
                          className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={formData.cvv}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cvv: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          required
                        />
                        <div className="absolute right-2 top-8 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(formData.cvv, "cvv")}
                            className="p-1.5 text-gray-400"
                          >
                            {copiedField === "cvv" ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            type="button"
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
                {/* Notas adicionales para las tarjetas e inicios de sesión */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Notas adicionales
                  </label>
                  <textarea
                    className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {/* Acciones del Formulario */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoadingPass}
                className={`flex-1 text-white py-2.5 rounded-lg font-bold shadow-lg disabled:bg-gray-400 
                  ${type === "CARD" ? "bg-emerald-600" : type === "NOTE" ? "bg-amber-600" : "bg-blue-600"}`}
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
