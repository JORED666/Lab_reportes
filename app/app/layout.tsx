import { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard de Reportes SQL',
  description: 'Sistema de reportes con PostgreSQL Views',
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <header style={{ 
            background: '#2563eb', 
            color: 'white', 
            padding: '1rem 2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ margin: 0 }}>📊 Dashboard de Reportes SQL</h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>PostgreSQL Views + Next.js + Docker</p>
          </header>
          <main style={{ padding: '2rem' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
