import { db } from '@/lib/db';
import { validateClientesFilter } from '@/lib/validations';
import Link from 'next/link';

export default async function Reporte2({ searchParams }) {
  const params = await searchParams;
  
  // ⭐ VALIDACIÓN CON ZOD
  const validated = validateClientesFilter({
    segmento: params.segmento,
    page: params.page || '1',
    limit: params.limit || '20'
  });
  
  const offset = (validated.page - 1) * validated.limit;
  
  const data = await db.getAnalisisClientes({ 
    segmento: validated.segmento, 
    limit: validated.limit, 
    offset 
  });
  
  const total = await db.countClientes(validated.segmento);
  const totalPages = Math.ceil(total / validated.limit);

  return (
    <div>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Volver</Link>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>👥 Análisis de Clientes</h2>
        <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
          Segmentación con CTE, ROW_NUMBER, COALESCE ⭐ CON FILTROS (Zod) + PAGINACIÓN
        </p>
      </div>

      <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>⭐ Validación Zod:</strong> Segmento (VIP/Regular/Activo/Nuevo), Page, Limit
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Filtrar por segmento:</strong>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <FilterButton href="/reports/2" active={!validated.segmento}>Todos</FilterButton>
          <FilterButton href="/reports/2?segmento=VIP" active={validated.segmento === 'VIP'}>VIP</FilterButton>
          <FilterButton href="/reports/2?segmento=Regular" active={validated.segmento === 'Regular'}>Regular</FilterButton>
          <FilterButton href="/reports/2?segmento=Activo" active={validated.segmento === 'Activo'}>Activo</FilterButton>
          <FilterButton href="/reports/2?segmento=Nuevo" active={validated.segmento === 'Nuevo'}>Nuevo</FilterButton>
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
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{row.orden_valor}</td>
                <td style={{ padding: '0.75rem' }}>{row.nombre}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.cantidad_ordenes}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                  ${Number(row.total_gastado).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span style={{ 
                    background: row.segmento_cliente === 'VIP' ? '#a855f7' : '#3b82f6',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {row.segmento_cliente}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
          {validated.page > 1 && (
            <Link href={`/reports/2?page=${validated.page - 1}${validated.segmento ? `&segmento=${validated.segmento}` : ''}`} 
                  style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              ← Anterior
            </Link>
          )}
          <span style={{ padding: '0.5rem 1rem', background: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            Página {validated.page} de {totalPages}
          </span>
          {validated.page < totalPages && (
            <Link href={`/reports/2?page=${validated.page + 1}${validated.segmento ? `&segmento=${validated.segmento}` : ''}`}
                  style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function FilterButton({ href, active, children }) {
  return (
    <Link href={href} style={{
      padding: '0.5rem 1rem',
      background: active ? '#10b981' : '#f3f4f6',
      color: active ? 'white' : '#374151',
      borderRadius: '4px',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: active ? '600' : '400'
    }}>
      {children}
    </Link>
  );
}
