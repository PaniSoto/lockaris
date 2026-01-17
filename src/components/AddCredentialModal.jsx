"use client";
import { Eye, EyeClosed, Shuffle, Loader2, CreditCard as CardIcon, Lock, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function AddCredentialModal({ isOpen, onClose, initialData = null, type = "LOGIN" }) {
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

  const [showPassword, setShowPassword] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [isLoadingPass, setIsLoadingPass] = useState(false);

  // Formateador visual para el número de tarjeta
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

  const handleGeneratePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true); 
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      setShowPassword(false);
      setShowCardNumber(false);
      setShowCvv(false);
      
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
          cvv: "" 
        });

        setIsLoadingPass(true);
        try {
          const res = await fetch(`/api/credentials/${initialData.id}`, { method: 'POST' });
          const data = await res.json();

          if (initialData.type === "CARD") {
            setFormData(prev => ({
              ...prev,
              cardNumber: data.cardNumber || "",
              cvv: data.cvv || "",
              cardholderName: data.cardholderName || prev.cardholderName,
              expiryDate: data.expiryDate || prev.expiryDate,
              notes: data.notes || prev.notes
            }));
          } else if (initialData.type === "NOTE") {
            setFormData(prev => ({ ...prev, notes: data.notes || "" }));
          } else {
            if (data.password) {
              setFormData(prev => ({ ...prev, password: data.password, notes: data.notes || prev.notes }));
            }
          }
        } catch (error) {
          console.error("Error al recuperar datos:", error);
        } finally {
          setIsLoadingPass(false);
        }
      } else {
        setFormData({ 
          serviceName: "", username: "", password: "", url: "", notes: "",
          cardholderName: "", cardNumber: "", expiryDate: "", cvv: "" 
        });
      }
    };

    loadData();
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData;
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing ? `/api/credentials/${initialData.id}` : "/api/credentials";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type }), 
      });

      if (response.ok) {
        onClose(true); 
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {type === "CARD" ? <CardIcon className="text-emerald-500" /> : type === "NOTE" ? <FileText className="text-amber-500" /> : <Lock className="text-blue-500" />}
              {initialData ? "Editar" : "Nuevo"} {type === "CARD" ? "Tarjeta" : type === "NOTE" ? "Nota Segura" : "Inicio de Sesión"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                {type === "CARD" ? "Banco / Nombre Tarjeta" : type === "NOTE" ? "Título de la Nota" : "Servicio"}
              </label>
              <input 
                type="text" 
                className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                required 
              />
            </div>

            {type === "NOTE" ? (
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Contenido de la Nota Segura</label>
                <textarea 
                  className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-64 resize-none"
                  placeholder={isLoadingPass ? "Descifrando contenido..." : "Escribe aquí tu información sensible..."}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  required
                  disabled={isLoadingPass}
                />
              </div>
            ) : (
              <>
                {type === "LOGIN" ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Usuario</label>
                      <input type="text" className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Contraseña</label>
                      <div className="relative group">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder={isLoadingPass ? "Cargando..." : "********"}
                          className="w-full p-2.5 pr-20 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={!initialData}
                          disabled={isLoadingPass}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {!isLoadingPass && (
                            <>
                              <button type="button" onClick={handleGeneratePassword} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"><Shuffle className="w-5 h-5"/></button>
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">{showPassword ? <EyeClosed className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Campos de CARD (omitidos aquí por brevedad, pero mantenlos igual que en tu código original) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Titular</label>
                      <input type="text" className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase" value={formData.cardholderName} onChange={(e) => setFormData({...formData, cardholderName: e.target.value.toUpperCase()})} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Número de Tarjeta</label>
                      <div className="relative">
                        <input type={showCardNumber ? "text" : "password"} maxLength="19" className="w-full p-2.5 pr-10 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})} required />
                        <button type="button" onClick={() => setShowCardNumber(!showCardNumber)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCardNumber ? <EyeClosed size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Expiración</label>
                            <input type="text" placeholder="MM/YY" maxLength="5" className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.expiryDate} onChange={(e) => {
                                let v = e.target.value.replace(/\D/g,'');
                                if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                                setFormData({...formData, expiryDate: v});
                            }} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">CVV</label>
                            <div className="relative">
                                <input type={showCvv ? "text" : "password"} maxLength="4" className="w-full p-2.5 pr-10 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.cvv} onChange={(e) => setFormData({...formData, cvv: e.target.value.replace(/\D/g,'')})} required />
                                <button type="button" onClick={() => setShowCvv(!showCvv)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCvv ? <EyeClosed size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notas adicionales</label>
                  <textarea className="w-full p-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={isLoadingPass} className={`flex-1 text-white py-2.5 rounded-lg font-bold shadow-lg disabled:bg-gray-400 ${type === 'CARD' ? 'bg-emerald-600' : type === 'NOTE' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                {initialData ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}