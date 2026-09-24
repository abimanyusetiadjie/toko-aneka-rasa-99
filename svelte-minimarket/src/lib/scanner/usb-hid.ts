/**
 * Hardware Barcode Scanner Listener (USB HID Wedge & Bluetooth/Wireless Scanner)
 * Dirancang tahan banting untuk:
 * - Scanner USB kabel, wireless dongle 2.4GHz, dan Bluetooth
 * - Latensi burst radio wireless (interval hingga 150ms)
 * - Pembersihan AIM Code Identifier otomatis (misal prefix "]C1" pada Code 128)
 * - Akhiran Enter (\r/\n) maupun Tab (\t)
 */

export interface ScannerOptions {
	minChars?: number;
	maxIntervalMs?: number;
	onScan: (barcode: string) => void;
}

export class BarcodeScannerListener {
	private buffer: string = '';
	private lastKeyTime: number = 0;
	private minChars: number;
	private maxIntervalMs: number;
	private onScan: (barcode: string) => void;
	private handler: (e: KeyboardEvent) => void;
	private finishTimer: any = null;

	constructor(options: ScannerOptions) {
		this.minChars = options.minChars || 3;
		// Scanner wireless sering memiliki jeda paket 90-120ms antar karakter, gunakan default 150ms
		this.maxIntervalMs = options.maxIntervalMs || 150;
		this.onScan = options.onScan;

		this.handler = this.handleKeyDown.bind(this);
	}

	public attach() {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', this.handler, true);
		}
	}

	public detach() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', this.handler, true);
			if (this.finishTimer) clearTimeout(this.finishTimer);
		}
	}

	private cleanBarcode(code: string): string {
		return code
			.trim()
			// Bersihkan AIM identifier (misal "]C1", "]e0", "]d2", dsb.)
			.replace(/^\][A-Za-z0-9]{2}/i, '')
			// Bersihkan karakter kontrol ASCII (STX, ETX, NUL)
			.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
	}

	private submitBuffer() {
		if (this.finishTimer) {
			clearTimeout(this.finishTimer);
			this.finishTimer = null;
		}

		const cleaned = this.cleanBarcode(this.buffer);
		this.buffer = '';

		if (cleaned.length >= this.minChars) {
			this.onScan(cleaned);
		}
	}

	private handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		const isFocusedOnOtherInput =
			target &&
			(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
			target.id !== 'pos-barcode';

		// Jika kasir sedang fokus mengetik nominal uang atau nama di modal lain,
		// jangan ganggu ketikan normal manusia
		if (isFocusedOnOtherInput && !e.ctrlKey && !e.altKey) {
			// Lewati kecuali tombol Enter
			if (e.key !== 'Enter') return;
		}

		const now = Date.now();
		const interval = now - this.lastKeyTime;
		this.lastKeyTime = now;

		// Jika jeda terlalu lama, anggap ketikan manual baru dimulai
		if (interval > this.maxIntervalMs && this.buffer.length > 0) {
			this.buffer = '';
		}

		// Jika scanner mengirimkan Enter atau Tab sebagai pemisah akhir
		if (e.key === 'Enter' || e.key === 'Tab') {
			if (this.buffer.length >= this.minChars) {
				e.preventDefault();
				e.stopPropagation();
				this.submitBuffer();
			} else {
				this.buffer = '';
			}
			return;
		}

		// Tangkap karakter alfanumerik biasa
		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			this.buffer += e.key;

			// Timer darurat: jika scanner tidak memiliki suffix Enter,
			// dan mengetik sangat cepat (kecepatan scanner < 60ms), otomatis submit setelah jeda 140ms
			if (this.buffer.length >= 6) {
				if (this.finishTimer) clearTimeout(this.finishTimer);
				this.finishTimer = setTimeout(() => {
					if (this.buffer.length >= this.minChars) {
						this.submitBuffer();
					}
				}, 140);
			}
		}
	}
}
