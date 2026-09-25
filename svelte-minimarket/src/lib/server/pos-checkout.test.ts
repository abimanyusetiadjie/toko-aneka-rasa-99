import { describe, it, expect } from 'vitest';
import { getProductForCheckout, updateMemoryProductStock } from './db';

describe('POS Resilient Lookup and Stock Sync', () => {
	it('should lookup Kemplang Panggang 33 Besar via Barcode 100751', () => {
		const unit = getProductForCheckout('100751');
		expect(unit).not.toBeNull();
		expect(unit?.product_name).toContain('33 Besar');
		expect(unit?.stock).toBeGreaterThanOrEqual(17);
	});

	it('should lookup via UUID (product_id)', () => {
		const unit = getProductForCheckout('a9900000-0000-0000-0000-000000000038');
		expect(unit).not.toBeNull();
		expect(unit?.product_name).toContain('33 Besar');
	});

	it('should lookup via unit- prefix (fallback format)', () => {
		const unit = getProductForCheckout('unit-a9900000-0000-0000-0000-000000000038');
		expect(unit).not.toBeNull();
		expect(unit?.product_name).toContain('33 Besar');
	});

	it('should synchronize stock updates across lookups', () => {
		updateMemoryProductStock('100751', 25);
		const unit = getProductForCheckout('100751');
		expect(unit?.stock).toBe(25);
	});

	it('should lookup Indomie Kaldu Udang Bangka via deterministic UUID', () => {
		const unit = getProductForCheckout('a9900000-0000-0000-0000-000000000071');
		expect(unit).not.toBeNull();
		expect(unit?.product_name).toContain('Indomie Kaldu Udang');
		expect(unit?.price).toBe(4000);
	});

	it('should lookup Indomie Kaldu Udang Bangka via 6-digit barcode 700005', () => {
		const unit = getProductForCheckout('700005');
		expect(unit).not.toBeNull();
		expect(unit?.product_name).toContain('Indomie Kaldu Udang');
		expect(unit?.price).toBe(4000);
	});
});
