import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./styles/main.css";

export const metadata: Metadata = {
  title: "Bitcoin Holdings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-white relative antialiased font-sans">
        <ThemeProvider attribute="data-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
