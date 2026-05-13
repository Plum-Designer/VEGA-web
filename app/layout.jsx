import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'V.E.G.A',
  description: 'Virtual Executive General Assistant — your private day manager',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'V.E.G.A' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="V.E.G.A" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
