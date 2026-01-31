import Link from 'next/link';
import { db } from '@/lib/db';

export default async function HomePage() {
  const [ejecutivo] = await db.getReporteEjecutivo();
  
  const reportes = [
    { id: 1, titulo: 'Ventas por Categoría', desc: 'Análisis de ventas con ranking y performance', icon: '📊' },
    { id: 2, titulo: 'Análisis de Clientes', desc: 'Segmentación de clientes con filtros', icon: '👥' },
    { id: 3, titulo: 'Productos Top', desc: 'Top productos con paginación', icon: '📦' },
    { id: 4, titulo: 'Estado de Órdenes', desc: 'Dashboard de órdenes por status', icon: '📋' },
    { id: 5, titulo: 'Reporte Ejecutivo', desc: 'KPIs consolidados del negocio', icon: '🎯' }
  ];

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Panel de Control</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <KPI label="Clientes Activos" value={ejecutivo.clientes_activos} />
          <KPI label="Productos" value={ejecutivo.total_productos} />
          <KPI label="Órdenes" value={ejecutivo.total_ordenes} />
          <KPI label="Health Score" value={ejecutivo.health_score_negocio} />
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Reportes Disponibles</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {reportes.map(r => (
          <Link key={r.id} href={`/reports/${r.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{r.icon}</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{r.titulo}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{r.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '6px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{label}</div>
    </div>
  );
}
