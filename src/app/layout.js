import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { CartProvider } from "@/components/contexts/CartContext";
import { WishlistProvider } from "@/components/contexts/WishlistContext";
import { OrderCountProvider } from "@/components/contexts/OrderCountContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wallineex",
  description: "Wallineex is your one-stop digital marketplace for high-quality digital products, powerful online tools, creative Reels bundles, and insightful eBooks. Discover and download premium digital resources to boost your productivity, creativity, and online success.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderCountProvider>
                {children}
              </OrderCountProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
