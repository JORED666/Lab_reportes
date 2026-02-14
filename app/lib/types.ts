export interface VentasPorCategoria {
  categoria_id: number;
  categoria: string;
  total_ordenes: number;
  total_ventas: string;
  ticket_promedio: string;
  ranking_ventas: number;
  porcentaje_total_ventas: string;
  performance_categoria: 'Excelente' | 'Bueno' | 'Regular';
}

export interface AnalisisCliente {
  usuario_id: number;
  nombre: string;
  email: string;
  cantidad_ordenes: number;
  total_gastado: string;
  promedio_por_orden: string;
  orden_valor: number;
  segmento_cliente: 'VIP' | 'Regular' | 'Activo' | 'Nuevo';
}

export interface ProductoTop {
  producto_id: number;
  codigo: string;
  producto: string;
  categoria: string;
  precio_actual: string;
  stock_actual: number;
  unidades_vendidas: number;
  ingresos_totales: string;
  ranking_ventas: number;
  alerta_inventario: 'SIN STOCK' | 'CRÍTICO' | 'BAJO' | 'NORMAL';
}

export interface EstadoOrden {
  status: string;
  total_ordenes: number;
  valor_total: string;
  valor_promedio: string;
  valor_minimo: string;
  valor_maximo: string;
  porcentaje_ordenes: string;
  prioridad_atencion: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface ReporteEjecutivo {
  clientes_activos: number;
  total_clientes: number;
  total_productos: number;
  unidades_inventario: number;
  precio_promedio: string;
  total_ordenes: number;
  ordenes_exitosas: number;
  ingresos_totales: string;
  ticket_promedio: string;
  tasa_exito_ordenes: string;
  health_score_negocio: 'Excelente' | 'Bueno' | 'Regular';
}
