export interface Product {
	id: string;
	sku: string;
	name: string;
	category_id: string | number;
	category_name?: string;
	base_unit: string;
	base_hpp: number;
	stock: number;
	created_at?: string;
	updated_at?: string;
	selling_price?: number;
	price?: number;
	cost_price?: number;
	unit?: string;
	barcode?: string;
	is_taxable?: boolean;
	shopee_item_id?: number | null;
}

export interface ProductUnit {
	id: string;
	product_id: string;
	unit_name: string;
	conversion_factor: number;
	price: number;
	barcode: string;
	created_at?: string;
}

export interface CartItem {
	id: string; // unique cart entry key
	product_id: string;
	unit_id: string;
	name: string;
	unit_name: string;
	qty: number;
	price: number;
	conversion_factor: number;
	available_units: ProductUnit[];
	is_taxable?: boolean;
}

export interface Category {
	id: string | number;
	slug?: string;
	name: string;
	description?: string;
	shopee_category_id?: number | null;
}

export interface User {
	id: string;
	username: string;
	full_name: string;
	role_id: number;
	role_name?: string;
	created_at?: string;
}

export interface MLRule {
	id: number;
	antecedents: string;
	consequents: string;
	confidence: number;
	lift: number;
	support?: number;
}

export interface Recommendation {
	suggested_products: string;
	confidence: number;
	lift: number;
	message: string;
}

export type PaymentMethod = 'CASH' | 'DEBIT' | 'QRIS' | 'SHOPEE_PAY';

export interface ShopeeOrderItem {
	product_id?: string | null;
	sku: string;
	name: string;
	qty: number;
	price: number;
	subtotal: number;
}

export interface ShopeeOrder {
	id: string;
	order_sn: string;
	store_id: string;
	buyer_username: string;
	order_status: 'READY_TO_SHIP' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
	shipping_carrier: string;
	tracking_number?: string | null;
	total_amount: number;
	shopee_escrow_amount: number;
	items: ShopeeOrderItem[];
	stock_deducted: boolean;
	shopee_created_at: string;
	created_at: string;
	updated_at: string;
}

export interface PettyCashExpense {
	id: string;
	category: string;
	amount: number;
	notes: string;
	cashier: string;
	created_at: string;
}

export interface ShiftClosingSummary {
	closed_at: string;
	cashier_name: string;
	starting_cash: number;
	total_gross_sales: number;
	total_cash_sales: number;
	total_qris_sales: number;
	total_transfer_sales: number;
	transactions_count: number;
	total_expenses: number;
	expected_drawer_cash: number;
	counted_physical_cash: number;
	difference: number;
	status: 'BALANCED' | 'SURPLUS' | 'SHORTAGE';
}
