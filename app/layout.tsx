import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcaria | Klinikler için Yapay Zeka WhatsApp Hasta Karşılama",
  description:
    "Welcaria, klinikler için 7/24 çalışan yapay zeka hasta karşılama sistemi. WhatsApp'tan gelen hasta mesajlarına saniyeler içinde, hastanın dilinde profesyonel yanıt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
