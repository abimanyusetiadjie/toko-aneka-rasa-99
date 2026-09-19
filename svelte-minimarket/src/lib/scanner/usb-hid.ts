/**
 * Hardware Barcode Scanner Listener (USB HID Wedge & Bluetooth Scanner)
 * Menggunakan debounce buffer kecepatan tinggi (< 40ms) untuk membedakan
 * ketikan manusia vs pancaran laser scanner barcode fisik.
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

	constructor(options: ScannerOptions) {
		this.minChars = options.minChars || 3;
		this.maxIntervalMs = options.maxIntervalMs || 75;
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
		}
	}

	private handleKeyDown(e: KeyboardEvent) {
		const now = Date.now();
		const interval = now - this.lastKeyTime;
		this.lastKeyTime = now;

		// Jika jeda terlalu lama, reset buffer
		if (interval > this.maxIntervalMs && this.buffer.length > 0) {
			this.buffer = '';
		}

		// Jika tombol Enter ditekan
		if (e.key === 'Enter') {
			if (this.buffer.length >= this.minChars) {
				e.preventDefault();
				e.stopPropagation();
				const scannedCode = this.buffer.trim();
				this.buffer = '';
				this.onScan(scannedCode);
			} else {
				this.buffer = '';
			}
			return;
		}

		// Tangkap karakter biasa (angka / huruf barcode)
		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			this.buffer += e.key;
		}
	}
}
