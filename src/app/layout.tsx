import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow — Full-Stack Task Management System",
  description:
    "TaskFlow is a full-stack task management application built with Next.js 16, TypeScript, Prisma, SQLite and Tailwind CSS. Features JWT authentication, Kanban board, dashboard analytics and more. Developed by Brijesh Mishra.",
  keywords: [
    "TaskFlow",
    "Task Management",
    "Full Stack",
    "Next.js",
    "TypeScript",
    "Prisma",
    "Tailwind CSS",
    "Brijesh Mishra",
  ],
  authors: [{ name: "Brijesh Mishra" }],
  creator: "Brijesh Mishra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
