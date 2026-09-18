import { writable, get } from 'svelte/store';
import type { Product, ProductUnit } from '$lib/types';

export interface LocalCatalogItem {
	product: Product;
	scanned_unit: ProductUnit;
	all_units: ProductUnit[];
}

export interface OfflineTransaction {
	id: string;
	payload: any;
	receipt_number: string;
	created_at: string;
	status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
}

const LOCAL_STORAGE_CATALOG_KEY = 'smartpos_catalog_cache';
const LOCAL_STORAGE_OFFLINE_QUEUE_KEY = 'smartpos_offline_tx_queue';

export const isOnline = writable<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
export const localCatalog = writable<Map<string, LocalCatalogItem>>(new Map());
export const offlineQueue = writable<OfflineTransaction[]>([]);
export const isSyncingOffline = writable<boolean>(false);

// Inisialisasi Event Listener Jaringan
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		isOnline.set(true);
		syncOfflineQueue();
	});
	window.addEventListener('offline', () => {
		isOnline.set(false);
	});

	// Load stored catalog
	const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	try {
		const cached = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
		if (cached) {
			const parsed = JSON.parse(cached);
			const map = new Map<string, LocalCatalogItem>();
			for (const [key, val] of Object.entries(parsed)) {
				const item = val as LocalCatalogItem;
				if (item?.scanned_unit?.id && UUID_REGEX.test(item.scanned_unit.id)) {
					map.set(key, item);
				}
			}
			localCatalog.set(map);
		}
	} catch {}

	// Load stored offline queue
	try {
		const qCached = localStorage.getItem(LOCAL_STORAGE_OFFLINE_QUEUE_KEY);
		if (qCached) {
			offlineQueue.set(JSON.parse(qCached));
		}
	} catch {}
}

/**
 * Simpan/Update item ke dalam local catalog
 */
export function cacheProductItem(barcode: string, item: LocalCatalogItem) {
	localCatalog.update((map) => {
		map.set(barcode, item);
		if (typeof window !== 'undefined') {
			try {
				const obj: Record<string, LocalCatalogItem> = {};
				map.forEach((v, k) => {
					obj[k] = v;
				});
				localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(obj));
			} catch {}
		}
		return map;
	});
}

/**
 * Cari produk dari local cache (Latensi < 2ms)
 */
export function findLocalProduct(barcode: string): LocalCatalogItem | null {
	const map = get(localCatalog);
	return map.get(barcode) || null;
}

/**
 * Masukkan transaksi ke antrean offline jika koneksi internet terputus
 */
export function enqueueOfflineTransaction(payload: any, receiptNumber: string) {
	const tx: OfflineTransaction = {
		id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		payload,
		receipt_number: receiptNumber,
		created_at: new Date().toISOString(),
		status: 'PENDING_SYNC'
	};

	offlineQueue.update((list) => {
		const updated = [...list, tx];
		if (typeof window !== 'undefined') {
			localStorage.setItem(LOCAL_STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(updated));
		}
		return updated;
	});
}

/**
 * Sinkronisasi seluruh transaksi offline yang tertunda ke Supabase
 */
export async function syncOfflineQueue() {
	const queue = get(offlineQueue);
	if (queue.length === 0 || get(isSyncingOffline)) return;

	isSyncingOffline.set(true);
	const remaining: OfflineTransaction[] = [];

	for (const item of queue) {
		try {
			const res = await fetch('/api/pos/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item.payload)
			});

			if (!res.ok) {
				remaining.push(item);
			}
		} catch {
			remaining.push(item);
		}
	}

	offlineQueue.set(remaining);
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
	}
	isSyncingOffline.set(false);
}

export const REALTIME_CHANNEL_NAME = 'smartpos_realtime_sync';
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
	try {
		syncChannel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
		syncChannel.onmessage = (event) => {
			if (event.data?.type === 'TRANSACTION_COMPLETED' && event.data?.items) {
				applyLocalStockDeduction(event.data.items);
			} else if (event.data?.type === 'STOCK_CHANGED' && event.data?.items) {
				updateLocalStockBalance(event.data.items);
			}
		};
	} catch {}
}

/**
 * Kurangi sisa stok barang di katalog lokal & siarkan sinyal sinkronisasi
 */
export function deductLocalStock(items: { productId: string; baseQty: number }[], receiptNumber?: string) {
	applyLocalStockDeduction(items);

	if (syncChannel) {
		try {
			syncChannel.postMessage({
				type: 'TRANSACTION_COMPLETED',
				receiptNumber,
				items,
				timestamp: new Date().toISOString()
			});
		} catch {}
	}
}

function applyLocalStockDeduction(items: { productId: string; baseQty: number }[]) {
	localCatalog.update((map) => {
		for (const item of items) {
			for (const [key, catalogEntry] of map.entries()) {
				if (catalogEntry.product.id === item.productId) {
					catalogEntry.product.stock = Math.max(0, Number(catalogEntry.product.stock || 0) - item.baseQty);
				}
			}
		}
		if (typeof window !== 'undefined') {
			try {
				const obj: Record<string, LocalCatalogItem> = {};
				map.forEach((v, k) => {
					obj[k] = v;
				});
				localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(obj));
			} catch {}
		}
		return map;
	});
}

/**
 * Update saldo stok barang di katalog lokal saat ada barang masuk / restock / opname
 */
export function updateLocalStockBalance(items: { productId: string; newBalance?: number; qty?: number; price?: number }[]) {
	localCatalog.update((map) => {
		for (const item of items) {
			for (const [key, catalogEntry] of map.entries()) {
				if (catalogEntry.product.id === item.productId) {
					if (typeof item.newBalance === 'number') {
						catalogEntry.product.stock = item.newBalance;
					} else if (typeof item.qty === 'number') {
						catalogEntry.product.stock = Number(catalogEntry.product.stock || 0) + item.qty;
					}
					if (typeof item.price === 'number') {
						catalogEntry.product.price = item.price;
						catalogEntry.product.selling_price = item.price;
						if (catalogEntry.scanned_unit) catalogEntry.scanned_unit.price = item.price;
						if (catalogEntry.all_units) {
							for (const u of catalogEntry.all_units) {
								if (u.conversion_factor === 1) u.price = item.price;
							}
						}
					}
				}
			}
		}
		if (typeof window !== 'undefined') {
			try {
				const obj: Record<string, LocalCatalogItem> = {};
				map.forEach((v, k) => {
					obj[k] = v;
				});
				localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(obj));
			} catch {}
		}
		return map;
	});
}

