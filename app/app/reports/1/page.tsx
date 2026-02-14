import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Reporte1() {
  const data = await db.getVentasPorCategoria();
  
  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver al Dashboard</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>📊 Ventas por Categoría</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Análisis de performance de ventas por categoría con ranking y clasificación
        </p>
        <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
          view_ventas_por_categoria
        </code>
      </div>

      <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Características SQL:</strong> SUM, COUNT, AVG, RANK() OVER, CASE, GROUP BY, HAVING
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ranking</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Categoría</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Órdenes</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Ventas</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>% Total</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#2563eb' }}>{row.ranking_ventas}</td>
                <td style={{ padding: '0.75rem' }}>{row.categoria}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.total_ordenes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                  ${Number(row.total_ventas).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.porcentaje_total_ventas}%</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <Badge text={row.performance_categoria} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BadgeProps {
  text: string;
}

function Badge({ text }: BadgeProps) {
  const colors: Record<string, string> = {
    'Excelente': '#10b981',
    'Bueno': '#3b82f6',
    'Regular': '#f59e0b'
  };
  return (
    <span style={{
      background: colors[text] || '#6b7280',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontWeight: '500'
    }}>
      {text}
    </span>
  );
}
