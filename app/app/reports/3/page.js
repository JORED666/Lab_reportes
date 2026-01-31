import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Reporte3({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const data = await db.getProductosTop({ limit, offset });
  const total = await db.countProductos();
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>📦 Productos Top</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Top productos con alertas de inventario (CON PAGINACIÓN)
        </p>
      </div>

      <div style={{ background: '#fae8ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Características SQL:</strong> RANK(), CASE (alertas), GROUP BY, HAVING
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Producto</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Categoría</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Vendidas</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Stock</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Ingresos</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#a855f7' }}>{row.ranking_ventas}</td>
                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{row.producto}</td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>{row.categoria}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.unidades_vendidas}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.stock_actual}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                  ${Number(row.ingresos_totales).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <AlertBadge text={row.alerta_inventario} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {page > 1 && (
            <Link href={`/reports/3?page=${page - 1}`} 
                  style={{ padding: '0.5rem 1rem', background: '#a855f7', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Anterior
            </Link>
          )}
          <span style={{ padding: '0.5rem 1rem' }}>Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link href={`/reports/3?page=${page + 1}`}
                  style={{ padding: '0.5rem 1rem', background: '#a855f7', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function AlertBadge({ text }) {
  const colors = {
    'SIN STOCK': '#ef4444',
    'CRÍTICO': '#f97316',
    'BAJO': '#eab308',
    'NORMAL': '#10b981'
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
