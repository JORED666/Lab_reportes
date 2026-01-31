import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Reporte5() {
  const [data] = await db.getReporteEjecutivo();

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>🎯 Reporte Ejecutivo</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          KPIs consolidados con CTEs múltiples y FILTER
        </p>
      </div>

      <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Características SQL:</strong> 4 CTEs (WITH), FILTER, COALESCE, NULLIF, CASE (health score)
      </div>

      <div style={{ 
        background: data.health_score_negocio === 'Excelente' ? '#10b981' : '#eab308',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Health Score del Negocio</h3>
        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{data.health_score_negocio}</div>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Tasa de éxito: {data.tasa_exito_ordenes}%
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <MetricCard title="👥 Clientes" metrics={[
          { label: 'Total', value: data.total_clientes },
          { label: 'Activos', value: data.clientes_activos, highlight: true }
        ]} />

        <MetricCard title="📦 Inventario" metrics={[
          { label: 'Productos', value: data.total_productos },
          { label: 'Unidades', value: data.unidades_inventario },
          { label: 'Precio Promedio', value: `$${Number(data.precio_promedio).toFixed(2)}` }
        ]} />

        <MetricCard title="💰 Ventas" metrics={[
          { label: 'Total Órdenes', value: data.total_ordenes },
          { label: 'Exitosas', value: data.ordenes_exitosas, highlight: true },
          { label: 'Ingresos', value: `$${Number(data.ingresos_totales).toLocaleString()}`, highlight: true },
          { label: 'Ticket Promedio', value: `$${Number(data.ticket_promedio).toLocaleString()}` }
        ]} />
      </div>
    </div>
  );
}

function MetricCard({ title, metrics }) {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{m.label}</span>
            <span style={{ 
              fontWeight: m.highlight ? 'bold' : 'normal',
              color: m.highlight ? '#2563eb' : '#1f2937'
            }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
