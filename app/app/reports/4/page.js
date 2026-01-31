import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Reporte4() {
  const data = await db.getEstadoOrdenes();

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>📋 Estado de Órdenes</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Dashboard de órdenes por status con métricas agregadas
        </p>
      </div>

      <div style={{ background: '#ffedd5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Características SQL:</strong> SUM, AVG, MIN, MAX, Window Function (%), CASE (prioridad)
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Cantidad</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Valor Total</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Promedio</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>% Total</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: '500', textTransform: 'capitalize' }}>{row.status}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.total_ordenes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                  ${Number(row.valor_total).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  ${Number(row.valor_promedio).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.porcentaje_ordenes}%</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <PrioridadBadge text={row.prioridad_atencion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrioridadBadge({ text }) {
  const colors = {
    'ALTA': '#ef4444',
    'MEDIA': '#eab308',
    'BAJA': '#10b981'
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
