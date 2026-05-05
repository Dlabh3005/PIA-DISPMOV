/**
 * Catálogo estático de precios y duración por tipo de servicio.
 * Fuente de verdad para expenses.tsx y services.tsx.
 * Si Firestore tiene un precio distinto, este valor tiene prioridad.
 */
export interface ServiceCatalogItem {
  name: string;
  price: number;      // MXN
  duration: string;
  emoji: string;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { name: "Cambio de aceite", price: 600, duration: "1 hora", emoji: "🛢️" },
  { name: "Revisión general", price: 800, duration: "2 horas", emoji: "🔍" },
  { name: "Cambio de frenos", price: 1700, duration: "2 horas", emoji: "🛞" },
  { name: "Alineación", price: 1200, duration: "2 horas", emoji: "📐" },
  { name: "Diagnóstico electrónico", price: 1000, duration: "1 hora", emoji: "💻" },
];

/** Mapa nombre → precio numérico, listo para lookup O(1) */
export const PRICE_MAP: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((s) => [s.name, s.price])
);
