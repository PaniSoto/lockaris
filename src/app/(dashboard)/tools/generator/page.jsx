"use client";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/PageHeader";

export default function GeneratorPage() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const charsets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+",
    };

    let availableChars = "";
    if (options.uppercase) availableChars += charsets.uppercase;
    if (options.lowercase) availableChars += charsets.lowercase;
    if (options.numbers) availableChars += charsets.numbers;
    if (options.symbols) availableChars += charsets.symbols;

    if (!availableChars) return setPassword("Selecciona una opción");

    let generated = Array.from({ length }, () =>
      availableChars.charAt(Math.floor(Math.random() * availableChars.length)),
    ).join("");

    setPassword(generated);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50/50">
      <div className="mb-10">
        <PageHeader />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Sección de los resultados*/}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6 text-center group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>

          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl md:text-5xl font-mono tracking-tight text-gray-900 break-all leading-tight">
              {password}
            </span>

            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span> Copiado
                </>
              ) : (
                <> Copiar Contraseña</>
              )}
            </button>
          </div>
        </div>

        {/* Sección de configuración */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            {/* Control de la longitud */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Longitud de clave
                </label>
                <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-lg font-mono text-xl font-bold border border-blue-100">
                  {length}
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(options).map((opt) => (
                <div
                  key={opt}
                  onClick={() =>
                    setOptions({ ...options, [opt]: !options[opt] })
                  }
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    options[opt]
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${options[opt] ? "text-blue-900" : "text-gray-500"}`}
                  >
                    {opt === "uppercase"
                      ? "Mayúsculas"
                      : opt === "lowercase"
                        ? "Minúsculas"
                        : opt === "numbers"
                          ? "Números"
                          : "Símbolos"}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      options[opt]
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {options[opt] && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generatePassword}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              Generar Nueva Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
