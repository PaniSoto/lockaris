"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Lock, 
  LogOut, 
  ShieldCheck, 
  Key, 
  ChevronUp, 
  User,
  Settings 
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Referencia para detectar clics fuera del menú
  const menuRef = useRef(null);

  // Lógica para cerrar el menú al hacer clic en cualquier otro lugar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Estilo dinámico para los enlaces del Sidebar
  const getLinkStyle = (path) => {
    const isActive = pathname === path;
    return `w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-1 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-wide">
            <ShieldCheck className="text-blue-500" /> Lockaris
          </h1>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Principal
          </p>
          <Link href="/vault" className={getLinkStyle("/vault")}>
            <Lock size={20} /> Almacén
          </Link>
          
          <div className="pt-6">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Herramientas
            </p>
            <Link href="/tools/generator" className={getLinkStyle("/tools/generator")}>
              <Key size={20} /> Generador
            </Link>
          </div>
        </nav>

        {/* Sección de Usuario con Dropdown */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 relative" ref={menuRef}>
          
          {/* Menú Desplegable (Dropdown) */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <Link 
                href="/settings/account"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Settings size={16} /> Configuración
              </Link>
              
              <div className="h-px bg-slate-700 my-1" />
              
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}

          {/* Botón de Perfil */}
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>

            <ChevronUp 
              size={16} 
              className={`text-slate-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
      </aside>

      {/* Contenido de la página */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
        {children}
      </main>
    </div>
  );
}