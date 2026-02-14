import postgres from 'postgres';

// NUNCA hardcodear credenciales - siempre usar variable de entorno
const sql = postgres(process.env.DATABASE_URL || '', {
  max: 10
});

interface QueryParams {
  segmento?: string;
  limit?: number;
  offset?: number;
}

export const db = {
  async getVentasPorCategoria() {
    return sql`SELECT * FROM view_ventas_por_categoria` as any;
  },
  
  async getAnalisisClientes(params: QueryParams = {}) {
    const { segmento, limit = 20, offset = 0 } = params;
    if (segmento) {
      return sql`
        SELECT * FROM view_analisis_clientes 
        WHERE segmento_cliente = ${segmento}
        ORDER BY total_gastado DESC 
        LIMIT ${limit} OFFSET ${offset}
      ` as any;
    }
    return sql`
      SELECT * FROM view_analisis_clientes 
      ORDER BY total_gastado DESC 
      LIMIT ${limit} OFFSET ${offset}
    ` as any;
  },
  
  async countClientes(segmento?: string) {
    const result = segmento
      ? await sql`SELECT COUNT(*) as count FROM view_analisis_clientes WHERE segmento_cliente = ${segmento}`
      : await sql`SELECT COUNT(*) as count FROM view_analisis_clientes`;
    return Number(result[0]?.count || 0);
  },
  
  async getProductosTop(params: QueryParams = {}) {
    const { limit = 20, offset = 0 } = params;
    return sql`
      SELECT * FROM view_productos_top 
      ORDER BY unidades_vendidas DESC 
      LIMIT ${limit} OFFSET ${offset}
    ` as any;
  },
  
  async countProductos() {
    const result = await sql`SELECT COUNT(*) as count FROM view_productos_top`;
    return Number(result[0]?.count || 0);
  },
  
  async getEstadoOrdenes() {
    return sql`SELECT * FROM view_estado_ordenes` as any;
  },
  
  async getReporteEjecutivo() {
    return sql`SELECT * FROM view_reporte_ejecutivo` as any;
  }
};
