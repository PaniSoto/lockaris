import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Envolvemos todo con el Provider */}
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
