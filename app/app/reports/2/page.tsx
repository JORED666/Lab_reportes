import { db } from '@/lib/db';
import Link from 'next/link';

interface SearchParams {
  segmento?: string;
  page?: string;
}

export default async function Reporte2({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const segmento = params.segmento || null;
  const page = Number(params.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  const data = await db.getAnalisisClientes({ segmento: segmento ?? undefined, limit, offset });
  const total = await db.countClientes(segmento ?? undefined);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>👥 Análisis de Clientes</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Segmentación con CTE, ROW_NUMBER, COALESCE (CON FILTROS + PAGINACIÓN)
        </p>
      </div>

      <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Características SQL:</strong> CTE (WITH), ROW_NUMBER(), COALESCE, CASE
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Filtrar por segmento:</strong>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <FilterButton href="/reports/2" active={!segmento}>Todos</FilterButton>
          <FilterButton href="/reports/2?segmento=VIP" active={segmento === 'VIP'}>VIP</FilterButton>
          <FilterButton href="/reports/2?segmento=Regular" active={segmento === 'Regular'}>Regular</FilterButton>
          <FilterButton href="/reports/2?segmento=Activo" active={segmento === 'Activo'}>Activo</FilterButton>
          <FilterButton href="/reports/2?segmento=Nuevo" active={segmento === 'Nuevo'}>Nuevo</FilterButton>
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Órdenes</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Gastado</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Segmento</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{row.orden_valor}</td>
                <td style={{ padding: '0.75rem' }}>{row.nombre}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.cantidad_ordenes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                  ${Number(row.total_gastado).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{row.segmento_cliente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {page > 1 && (
            <Link href={`/reports/2?page=${page - 1}${segmento ? `&segmento=${segmento}` : ''}`} 
                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Anterior
            </Link>
          )}
          <span style={{ padding: '0.5rem 1rem' }}>Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link href={`/reports/2?page=${page + 1}${segmento ? `&segmento=${segmento}` : ''}`}
                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

interface FilterButtonProps {
  href: string;
  active: boolean;
  children: string;
}

function FilterButton({ href, active, children }: FilterButtonProps) {
  return (
    <Link href={href} style={{
      padding: '0.5rem 1rem',
      background: active ? '#2563eb' : '#f3f4f6',
      color: active ? 'white' : '#374151',
      borderRadius: '4px',
      textDecoration: 'none',
      fontSize: '0.9rem'
    }}>
      {children}
    </Link>
  );
}
