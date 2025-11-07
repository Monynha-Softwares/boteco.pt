// Auto-aligned with docs/sync.openapi.yaml (v0.1.0-draft)

export type EntityId = string; // uuid

export interface MetaResponse {
  tableStatus: string[];
  productCategory: string[];
  orderStatus: string[];
  maxBatch: number;
  supportsDelta: boolean;
  serverTime: string; // ISO date
}

export interface TableEntity {
  id: EntityId;
  company_id: EntityId;
  name: string;
  number?: number | null;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | string;
  capacity?: number | null;
  updated_at: string; // ISO date
}

export interface ProductEntity {
  id: EntityId;
  company_id: EntityId;
  name: string;
  category: 'drink' | 'food' | 'other' | string;
  price: number;
  stock?: number | null;
  min_stock?: number | null;
  updated_at: string; // ISO date
}

export interface OrderEntity {
  id: EntityId;
  company_id: EntityId;
  table_id: EntityId;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'canceled' | string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export interface OrderItemEntity {
  id: EntityId;
  order_id: EntityId;
  product_id: EntityId;
  quantity: number;
  price: number;
  updated_at: string; // ISO date
}

export interface SaleEntity {
  id: EntityId;
  company_id: EntityId;
  order_id: EntityId;
  total: number;
  payment_method: string;
  updated_at: string; // ISO date
}

export interface StockMovementEntity {
  id: EntityId;
  company_id: EntityId;
  product_id: EntityId;
  movement_type: string;
  quantity: number;
  created_at: string; // ISO date
}

export interface DownloadResponse {
  since?: string; // ISO date
  nextSince: string; // ISO date
  tables?: TableEntity[];
  products?: ProductEntity[];
  orders?: OrderEntity[];
  order_items?: OrderItemEntity[];
  sales?: SaleEntity[];
  stock_movements?: StockMovementEntity[];
  checksum?: string;
}

export interface UploadRequest {
  company_id: EntityId;
  clientTime: string; // ISO date
  tables?: TableEntity[];
  products?: ProductEntity[];
  orders?: OrderEntity[];
  order_items?: OrderItemEntity[];
  sales?: SaleEntity[];
  stock_movements?: StockMovementEntity[];
}

export interface UploadRejectedItem {
  id: EntityId;
  reason: string;
  server_updated_at?: string; // ISO date
}

export interface UploadResponse {
  accepted: Record<string, EntityId[]>; // entity -> ids
  rejected: Record<string, UploadRejectedItem[]>; // entity -> details
  errors?: Array<{ entity?: string; id?: EntityId; message: string }>;
  serverSince: string; // ISO date
}

export type EntityCollections = Pick<UploadRequest, 'tables' | 'products' | 'orders' | 'order_items' | 'sales' | 'stock_movements'>;
