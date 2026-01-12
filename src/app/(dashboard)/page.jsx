"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { 
  Lock, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Key, 
  Upload, 
  Download 
} from "lucide-react";

export default function Dashboard() {
  // Estado para controlar qué "pestaña" se muestra
  const [activeTab, setActiveTab] = useState("vault");

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* --- SIDEBAR (Barra Lateral) --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-wide">
            <ShieldCheck className="text-blue-500" /> Lockaris
          </h1>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          
          {/* SECCIÓN PRINCIPAL */}
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Principal
          </p>
          <button 
            onClick={() => setActiveTab("vault")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
              ${activeTab === 'vault' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Lock size={20} /> Almacén
          </button>

          {/* SECCIÓN HERRAMIENTAS */}
          <div className="pt-6">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Herramientas
            </p>
            
            <button 
              onClick={() => setActiveTab("generator")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-1
                ${activeTab === 'generator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Key size={20} /> Generador
            </button>
            
            <button 
              onClick={() => setActiveTab("import")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-1
                ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Upload size={20} /> Importar
            </button>
            
            <button 
              onClick={() => setActiveTab("export")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                ${activeTab === 'export' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Download size={20} /> Exportar
            </button>
          </div>
        </nav>

        {/* SECCIÓN INFERIOR (Usuario) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-2
              ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} /> Configuración
          </button>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO (Main) --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
        
        {/* VISTA: ALMACÉN */}
        {activeTab === "vault" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Mi Almacén</h2>
            <p className="text-slate-600">Aquí irá la tabla de contraseñas y el botón de añadir nueva.</p>
            {/* Aquí meteremos el componente <VaultTable /> más adelante */}
          </div>
        )}

        {/* VISTA: GENERADOR */}
        {activeTab === "generator" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Generador de Claves</h2>
            <p className="text-slate-600">Aquí irá la herramienta para crear contraseñas seguras.</p>
          </div>
        )}

        {/* VISTA: IMPORTAR */}
        {activeTab === "import" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Importar Datos</h2>
            <p className="text-slate-600">Sube tus archivos CSV o JSON aquí.</p>
          </div>
        )}

        {/* VISTA: EXPORTAR */}
        {activeTab === "export" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Exportar Datos</h2>
            <p className="text-slate-600">Descarga una copia de seguridad de tus claves.</p>
          </div>
        )}

        {/* VISTA: CONFIGURACIÓN */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Configuración</h2>
            <p className="text-slate-600">Ajustes de cuenta y seguridad.</p>
          </div>
        )}

      </main>
    </div>
  );
}