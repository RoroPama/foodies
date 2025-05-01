import "./globals.css";
import MainHeaderBackground from "./components/main-header/main-header-background";
import HeaderMain from "./components/main-header/header-main";

export const metadata = {
  title: "NextLevel Food",
  description:
    "Des plats délicieux, partagés par une communauté passionnée de cuisine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <MainHeaderBackground />
        <HeaderMain></HeaderMain>
        {children}
      </body>
    </html>
  );
}
