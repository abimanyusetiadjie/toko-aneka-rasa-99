/**
 * Modul Perhitungan Poin Member Minimarket
 * Aturan Bisnis:
 * 1. Setiap pembelanjaan Rp 10.000 mendapatkan 1 Poin
 * 2. Nilai penukaran: 10 Poin = Rp 100 Potongan Belanja (1 Poin = Rp 10)
 */

export const POINT_RULES = {
	SPEND_PER_POINT: 10000,
	VALUE_PER_10_POINTS: 100, // Rp 100 per 10 poin
	VALUE_PER_SINGLE_POINT: 10 // Rp 10 per 1 poin
};

/**
 * Hitung poin yang didapatkan dari total belanja
 */
export function calculatePointsEarned(totalSpend: number): number {
	if (totalSpend <= 0) return 0;
	return Math.floor(totalSpend / POINT_RULES.SPEND_PER_POINT);
}

/**
 * Hitung nilai rupiah dari poin yang ditukarkan
 */
export function calculatePointDiscount(pointsToRedeem: number, maxDiscountAllowed: number): {
	pointsUsed: number;
	discountAmount: number;
} {
	if (pointsToRedeem <= 0) return { pointsUsed: 0, discountAmount: 0 };
	
	// Poin dihitung per kelipatan 10 atau satuan
	const potentialDiscount = pointsToRedeem * POINT_RULES.VALUE_PER_SINGLE_POINT;
	const finalDiscount = Math.min(potentialDiscount, maxDiscountAllowed);
	const pointsUsed = Math.ceil(finalDiscount / POINT_RULES.VALUE_PER_SINGLE_POINT);

	return {
		pointsUsed,
		discountAmount: finalDiscount
	};
}
