import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeManager from '@/components/ThemeManager';
import PushPrompt from '@/components/PushPrompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfcfa' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1c1e' },
  ],
};

export const metadata: Metadata = {
  title: 'Mental Filter PWA',
  description: 'Mental Filter Progressive Web Application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mental Filter',
  },
  icons: {
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body>
        <ThemeManager />
        <PushPrompt />
        {children}
      </body>
    </html>
  );
}
