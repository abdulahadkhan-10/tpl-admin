import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const montserrat = Montserrat({
  variable: "--font-montserrat-google",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto-google",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "TPL Admin | Talent Pro League",
  description: "Admin Control Center for Talent Pro League operations, scouting, and competition management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-roboto">
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
