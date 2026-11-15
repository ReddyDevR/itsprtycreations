import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'ITSPRTYCREATIONS | Handcrafted Greeting Cards & Party Stationery',
  description:
    'Discover handcrafted greeting cards and party stationery at our online store. Discover luxury handcrafted greeting cards, editable Canva party favor chip bags, invitations, and milestone celebration stationery.',
  keywords: [
    'ITSPRTYCREATIONS',
    'LTS Party Creations',
    'ltsprtycreations',
    'greeting cards',
    'birthday greeting card',
    'anniversary card',
    'custom chip bag wrapper',
    'wedding invitation suite',
    'Canva editable printable',
  ],
  authors: [{ name: 'LTS Party Creations' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
