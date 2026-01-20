import { Providers } from "@/components/Providers";

import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Uso de providers para manejar temas y estado global */}
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
