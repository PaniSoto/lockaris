"use client";
import { usePathname } from "next/navigation";

export default function PageHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case "/vault":
        return "Almacén";
      case "/tools/generator":
        return "Generador";
      case "/settings/account":
        return "Configuración";
      default:
        return "Lockaris";
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-light tracking-tight text-slate-400">
        <span className="text-slate-900 text-3xl font-extrabold">
          {getTitle()}
        </span>
      </h1>
    </div>
  );
}
