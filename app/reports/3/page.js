import { db } from '@/lib/db';
import { validateProductosFilter } from '@/lib/validations';
import Link from 'next/link';

export default async function Reporte3({ searchParams }) {
  const params = await searchParams;
  
  // ⭐ VALIDACIÓN CON ZOD
  const validated = validateProductosFilter({
    page: params.page || '1',
    limit: params.limit || '10'
  });
  
  const offset = (validated.page - 1) * validated.limit;
  
  const data = await db.getProductosTop({ limit: validated.limit, offset });
  const total = await db.countProductos();
  const totalPages = Math.ceil(total / validated.limit);

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>📦 Productos Top</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Top productos con alertas de inventario ⭐ CON PAGINACIÓN (Zod validation)
        </p>
      </div>

      <div style={{ background: '#fae8ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>⭐ Validación Zod:</strong> Page (min 1), Limit (1-100)
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
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
          {validated.page > 1 && (
            <Link href={`/reports/3?page=${validated.page - 1}`} 
                  style={{ padding: '0.5rem 1rem', background: '#a855f7', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              ← Anterior
            </Link>
          )}
          <span style={{ padding: '0.5rem 1rem', background: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            Página {validated.page} de {totalPages}
          </span>
          {validated.page < totalPages && (
            <Link href={`/reports/3?page=${validated.page + 1}`}
                  style={{ padding: '0.5rem 1rem', background: '#a855f7', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Siguiente →
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
