import { Providers } from "@/components/Providers";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Envolvemos todo con el Provider */}
        <Providers>
          
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
