import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./styles/main.css";
import Footer from "./components/layout/footer";

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
          <div className="h-full flex justify-center items-center">
            <main className="h-full w-full">{children}</main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
