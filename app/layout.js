import { Inter, Anton } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

export const metadata = {
  title: "Elec Academy",
  description:
    "La plateforme d'Emre pour les apprentis électriciens : parcours en 11 modules, preuves de chantier corrigées, communauté et outils de calcul.",
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
