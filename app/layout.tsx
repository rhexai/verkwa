import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verkwa Susu | Manage Your Entire Susu Savings",
  description: "Secure savings and loan management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${instrumentSerif.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <header className="flex justify-end items-center p-4 gap-4 h-16 w-full absolute top-0 left-0 z-50">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-fuchsia-500/20">
                  Sign In
                </button>
              </SignInButton>
            </Show>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}




