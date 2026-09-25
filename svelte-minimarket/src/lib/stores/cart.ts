import { writable, derived, get } from 'svelte/store';
import type { CartItem, Product, ProductUnit, PaymentMethod } from '$lib/types';

const CART_DRAFT_STORAGE_KEY = 'smartpos_active_cart_draft';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Inisialisasi dari localStorage jika kasir reload / mati lampu
let initialCart: CartItem[] = [];
let initialPaymentMethod: PaymentMethod = 'CASH';
let initialMemberId = '';

if (typeof window !== 'undefined') {
	try {
		const savedDraft = localStorage.getItem(CART_DRAFT_STORAGE_KEY);
		if (savedDraft) {
			const parsed = JSON.parse(savedDraft);
			const rawCart = parsed.cart || [];
			// Bersihkan item lama jika ada unit_id yang bukan UUID valid
			initialCart = rawCart.filter((item: CartItem) => UUID_REGEX.test(item.unit_id));
			if (initialCart.length !== rawCart.length) {
				localStorage.removeItem(CART_DRAFT_STORAGE_KEY);
			}
			initialPaymentMethod = parsed.paymentMethod || 'CASH';
			initialMemberId = parsed.memberId || '';
		}
	} catch {}
}

export const cart = writable<CartItem[]>(initialCart);
export const paymentMethod = writable<PaymentMethod>(initialPaymentMethod);
export const amountPaid = writable<number | null>(null);
export const paymentRef = writable<string>('');
export const memberId = writable<string>(initialMemberId);
export const notification = writable<string>('');
export const isProcessing = writable<boolean>(false);
export const lastReceiptNumber = writable<string>('');
export const currentCheckoutSessionKey = writable<string>('');

// Auto-save draft keranjang saat kasir menambah/mengubah item
function persistCartDraft() {
	if (typeof window !== 'undefined') {
		try {
			const dataToSave = {
				cart: get(cart),
				paymentMethod: get(paymentMethod),
				memberId: get(memberId),
				saved_at: new Date().toISOString()
			};
			localStorage.setItem(CART_DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
		} catch {}
	}
}

export const subtotal = derived(cart, ($cart) =>
	Math.round($cart.reduce((sum, item) => sum + item.price * item.qty, 0))
);

export const discount = derived([subtotal, memberId], ([$subtotal, $memberId]) =>
	$memberId.trim() ? Math.round($subtotal * 0.05) : 0
);

export const total = derived([subtotal, discount], ([$subtotal, $discount]) =>
	Math.max(0, Math.round($subtotal - $discount))
);

export const totalPPN = derived(cart, ($cart) => {
	// PPN 11% dari barang yang Kena Pajak (Include Tax). PPN = Harga - (Harga / 1.11)
	let ppn = 0;
	for (const item of $cart) {
		if (item.is_taxable) {
			const itemSubtotal = item.price * item.qty;
			const dpp = itemSubtotal / 1.11;
			ppn += (itemSubtotal - dpp);
		}
	}
	return Math.round(ppn);
});

export const totalDPP = derived([total, totalPPN], ([$total, $totalPPN]) => {
	// DPP Total adalah Total Akhir dikurangi PPN
	return Math.max(0, $total - $totalPPN);
});

export const change = derived([total, amountPaid, paymentMethod], ([$total, $amountPaid, $paymentMethod]) => {
	if ($paymentMethod !== 'CASH' || !$amountPaid) return 0;
	return Math.max(0, Math.round($amountPaid - $total));
});

export function addItem(product: Product, scannedUnit: ProductUnit, allUnits: ProductUnit[]) {
	currentCheckoutSessionKey.set('');
	cart.update((items) => {
		const existingIndex = items.findIndex(
			(i) => i.product_id === product.id && i.unit_id === scannedUnit.id
		);

		if (existingIndex > -1) {
			items[existingIndex].qty += 1;
			const res = [...items];
			persistCartDraft();
			return res;
		} else {
			const parsedPrice = Number(scannedUnit.price);
			const parsedConversion = Number(scannedUnit.conversion_factor);
			
			// Guard: Jangan masukkan item dengan harga NaN atau 0 ke keranjang
			const safePrice = (!isNaN(parsedPrice) && parsedPrice > 0) ? parsedPrice : (Number(product.price) || 0);
			const safeConversion = (!isNaN(parsedConversion) && parsedConversion > 0) ? parsedConversion : 1;

			const newItem: CartItem = {
				id: `${product.id}-${scannedUnit.id}-${Date.now()}`,
				product_id: product.id,
				unit_id: scannedUnit.id,
				name: product.name,
				unit_name: scannedUnit.unit_name,
				qty: 1,
				price: safePrice,
				conversion_factor: safeConversion,
				available_units: allUnits && allUnits.length > 0 ? allUnits : [scannedUnit],
				is_taxable: product.is_taxable
			};
			const res = [newItem, ...items];
			persistCartDraft();
			return res;
		}
	});
}

export function updateQty(index: number, newQty: number) {
	currentCheckoutSessionKey.set('');
	cart.update((items) => {
		if (items[index]) {
			items[index].qty = Math.max(1, newQty);
		}
		persistCartDraft();
		return [...items];
	});
}

export function updateUnit(index: number, newUnitId: string) {
	currentCheckoutSessionKey.set('');
	cart.update((items) => {
		const item = items[index];
		if (item) {
			const selectedUnit = item.available_units.find((u) => u.id === newUnitId);
			if (selectedUnit) {
				item.unit_id = selectedUnit.id;
				item.unit_name = selectedUnit.unit_name;
				item.price = Number(selectedUnit.price);
				item.conversion_factor = Number(selectedUnit.conversion_factor);
			}
		}
		persistCartDraft();
		return [...items];
	});
}

export function removeItem(index: number) {
	currentCheckoutSessionKey.set('');
	cart.update((items) => {
		items.splice(index, 1);
		persistCartDraft();
		return [...items];
	});
}

export function resetCart() {
	cart.set([]);
	amountPaid.set(null);
	paymentRef.set('');
	memberId.set('');
	notification.set('');
	currentCheckoutSessionKey.set('');
	if (typeof window !== 'undefined') {
		try {
			localStorage.removeItem(CART_DRAFT_STORAGE_KEY);
		} catch {}
	}
}

/**
 * Dapatkan atau buat Idempotency Key yang stabil per sesi checkout
 */
export function getOrCreateSessionIdempotencyKey(): string {
	let key = get(currentCheckoutSessionKey);
	if (!key) {
		key = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		currentCheckoutSessionKey.set(key);
	}
	return key;
}
