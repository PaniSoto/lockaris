import { Providers } from "@/components/Providers";

import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
