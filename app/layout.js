import "./globals.css";

export const metadata = {
  title: "Elec Academy",
  description:
    "La plateforme d'Emre pour les apprentis électriciens : parcours en 11 modules, preuves de chantier corrigées, communauté et outils de calcul.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#15161a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
