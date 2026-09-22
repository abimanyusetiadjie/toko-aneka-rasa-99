<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import {
		cart,
		paymentMethod,
		amountPaid,
		paymentRef,
		memberId,
		isProcessing,
		lastReceiptNumber,
		subtotal,
		discount,
		total,
		totalDPP,
		totalPPN,
		change,
		addItem,
		updateQty,
		updateUnit,
		removeItem,
		resetCart,
		getOrCreateSessionIdempotencyKey
	} from '$lib/stores/cart';
	import {
		isOnline,
		findLocalProduct,
		cacheProductItem,
		enqueueOfflineTransaction,
		deductLocalStock,
		updateLocalStockBalance
	} from '$lib/stores/local-catalog.svelte';
	import { BarcodeScannerListener } from '$lib/scanner/usb-hid';
	import { calculatePointDiscount } from '$lib/services/points';
	import {
		ShoppingCart,
		Barcode,
		Trash2,
		Printer,
		CreditCard,
		Banknote,
		QrCode,
		ArrowLeft,
		User,
		Clock,
		HelpCircle,
		Wifi,
		WifiOff,
		CheckCircle2,
		Layers,
		Award,
		Zap,
		AlertTriangle,
		XCircle,
		Package,
		Camera,
		Search,
		Video,
		VideoOff,
		RefreshCw,
		Wallet,
		FileSpreadsheet,
		Plus,
		MessageCircle,
		Coins,
		Calendar,
		AlertCircle,
		Bell,
		BellRing,
		BellOff,
		Volume2,
		VolumeX,
		ShoppingBag,
		Settings,
		ExternalLink,
		Sparkles,
		Calculator,
		Check
	} from 'lucide-svelte';
	import type { PettyCashExpense } from '$lib/types';


	let { data } = $props();

	let barcodeInput: HTMLInputElement;
	let barcode = $state('');
	let cashierName = $derived(
		data?.user?.full_name || data?.user?.username || 'Kasir Toko'
	);
	let isOwner = $derived(
		data?.user?.role_id === 1 || data?.user?.username?.toLowerCase().includes('owner')
	);
	let storeName = $state('Toko Aneka Rasa 99');
	let storeAddress = $state('Poris Indah Blok B 11 No.1');
	let storePhone = $state('0812-3456-7890');
	let receiptItems = $state<{ name: string; qty: number; price: number }[]>([]);

	// Modals & Actionable Error Dialog
	let showHelpModal = $state(false);
	let showMemberModal = $state(false);
	let showSplitModal = $state(false);
	let showQRISModal = $state(false);
	let errorMessage = $state('');
	let errorAdvice = $state('');
	let showErrorModal = $state(false);

	// Success / Post-Checkout State
	let showSuccessModal = $state(false);
	let completedTxData = $state<any>(null);

	// Member State
	let memberPhoneInput = $state('');
	let currentMember = $state<any>(null);
	let pointsToRedeem = $state(0);
	let pointDiscountAmount = $state(0);

	// Split Payment State
	let splitCashAmount = $state<number>(0);
	let splitNonCashAmount = $state<number>(0);
	let splitNonCashMethod = $state<'DEBIT' | 'QRIS'>('QRIS');
	let splitNonCashRef = $state('');

	// QRIS Dynamic State
	let qrisRefId = $state('');
	let qrisQRString = $state('');
	let isQrisSettled = $state(false);

	// Petty Cash (Pengeluaran Kasir) State
	let showExpenseModal = $state(false);
	let expenseAmount = $state<number | null>(null);
	let expenseCategory = $state('Kantong Kresek / Plastik');
	let expenseNotes = $state('');
	let isSubmittingExpense = $state(false);
	let dailyExpenses = $state<PettyCashExpense[]>([]);

	// Tutup Kasir / Rekap Harian (Z-Report Shift) State
	let showClosingModal = $state(false);
	let startingCash = $state(200000); // Default Modal Awal Laci Rp 200.000
	let countedPhysicalCash = $state<number | null>(null);
	let todayTransactions = $state<any[]>([]);
	let ownerWhatsApp = $state('081234567890');
	let isPrintingClosing = $state(false);

	// Rekapitulasi Keuangan Shift
	let totalExpenses = $derived(
		dailyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
	);

	let totalCashSales = $derived(
		todayTransactions.reduce((sum, t) => {
			const amt = Number(t.cash_amount ?? t.cashAmount);
			if (!isNaN(amt) && amt > 0) return sum + amt;
			if (t.payment_method === 'CASH' || t.paymentMethod === 'CASH') return sum + (Number(t.total_amount ?? t.total) || 0);
			return sum;
		}, 0)
	);

	let totalQrisSales = $derived(
		todayTransactions.reduce((sum, t) => {
			const amt = Number(t.qris_amount ?? t.qrisAmount);
			if (!isNaN(amt) && amt > 0) return sum + amt;
			if (t.payment_method === 'QRIS' || t.paymentMethod === 'QRIS') return sum + (Number(t.total_amount ?? t.total) || 0);
			return sum;
		}, 0)
	);

	let totalTransferSales = $derived(
		todayTransactions.reduce((sum, t) => {
			const amt = Number(t.transfer_amount ?? t.transferAmount);
			if (!isNaN(amt) && amt > 0) return sum + amt;
			if (t.payment_method === 'DEBIT' || t.paymentMethod === 'DEBIT') return sum + (Number(t.total_amount ?? t.total) || 0);
			return sum;
		}, 0)
	);

	let totalGrossSales = $derived(
		todayTransactions.reduce((sum, t) => sum + (Number(t.total_amount ?? t.total) || 0), 0)
	);

	let expectedDrawerCash = $derived(
		Math.max(0, startingCash + totalCashSales - totalExpenses)
	);

	let cashDifference = $derived(
		countedPhysicalCash !== null ? countedPhysicalCash - expectedDrawerCash : null
	);

	async function handleAddExpense() {
		if (!expenseAmount || expenseAmount <= 0) {
			displayActionableError('Nominal Pengeluaran Tidak Valid', 'Silakan masukkan nominal pengeluaran kasir di atas Rp 0.');
			return;
		}

		isSubmittingExpense = true;
		const newExpense: PettyCashExpense = {
			id: `exp-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
			category: expenseCategory,
			amount: expenseAmount,
			notes: expenseNotes.trim() || expenseCategory,
			cashier: cashierName,
			created_at: new Date().toISOString()
		};

		dailyExpenses = [newExpense, ...dailyExpenses];
		if (typeof window !== 'undefined') {
			localStorage.setItem('aneka_pos_expenses', JSON.stringify(dailyExpenses));
		}

		try {
			await fetch('/api/pos/expenses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newExpense)
			});
		} catch (e) {
			console.warn('Expense saved locally', e);
		} finally {
			isSubmittingExpense = false;
			expenseAmount = null;
			expenseNotes = '';
		}
	}

	async function handleDeleteExpense(id: string) {
		if (!confirm('Hapus catatan pengeluaran kasir ini?')) return;
		dailyExpenses = dailyExpenses.filter(e => e.id !== id);
		if (typeof window !== 'undefined') {
			localStorage.setItem('aneka_pos_expenses', JSON.stringify(dailyExpenses));
		}
		try {
			await fetch(`/api/pos/expenses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
		} catch {}
	}

	function recordCompletedTransaction(tx: {
		receiptNumber: string;
		total: number;
		paymentMethod: string;
		cashAmount?: number;
		qrisAmount?: number;
		transferAmount?: number;
		itemsCount: number;
	}) {
		const newTx = {
			receipt_number: tx.receiptNumber,
			total_amount: tx.total,
			payment_method: tx.paymentMethod,
			cash_amount: tx.cashAmount ?? (tx.paymentMethod === 'CASH' ? tx.total : 0),
			qris_amount: tx.qrisAmount ?? (tx.paymentMethod === 'QRIS' ? tx.total : 0),
			transfer_amount: tx.transferAmount ?? (tx.paymentMethod === 'DEBIT' ? tx.total : 0),
			items_count: tx.itemsCount,
			created_at: new Date().toISOString()
		};
		todayTransactions = [newTx, ...todayTransactions];
		if (typeof window !== 'undefined') {
			localStorage.setItem('aneka_pos_today_tx', JSON.stringify(todayTransactions));
		}
	}

	async function fetchTodayShiftData() {
		try {
			const [expRes, txRes] = await Promise.all([
				fetch('/api/pos/expenses').then(r => r.ok ? r.json() : null).catch(() => null),
				fetch('/api/pos/transactions').then(r => r.ok ? r.json() : null).catch(() => null)
			]);

			if (expRes?.expenses && Array.isArray(expRes.expenses)) {
				const existingIds = new Set(dailyExpenses.map(e => e.id));
				const merged = [...dailyExpenses];
				for (const exp of expRes.expenses) {
					if (!existingIds.has(exp.id)) {
						merged.push(exp);
					}
				}
				dailyExpenses = merged;
				if (typeof window !== 'undefined') {
					localStorage.setItem('aneka_pos_expenses', JSON.stringify(dailyExpenses));
				}
			}

			if (txRes?.transactions && Array.isArray(txRes.transactions)) {
				const existingRec = new Set(todayTransactions.map(t => t.receipt_number));
				const merged = [...todayTransactions];
				for (const tx of txRes.transactions) {
					if (!existingRec.has(tx.receipt_number)) {
						merged.push(tx);
					}
				}
				todayTransactions = merged;
				if (typeof window !== 'undefined') {
					localStorage.setItem('aneka_pos_today_tx', JSON.stringify(todayTransactions));
				}
			}
		} catch (e) {
			console.error('Failed to sync shift data', e);
		}
	}

	function printShiftReport() {
		isPrintingClosing = true;
		tick().then(() => {
			setTimeout(() => {
				window.print();
				setTimeout(() => {
					isPrintingClosing = false;
				}, 1000);
			}, 150);
		});
	}

	function sendWhatsAppReport() {
		const now = new Date();
		const dateStr = now.toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
		const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

		const diffText = cashDifference === null
			? 'Belum dihitung fisik'
			: cashDifference === 0
				? '✅ PAS (Rp 0)'
				: cashDifference > 0
					? `🔵 SURPLUS (+Rp ${formatCurrency(cashDifference).replace('Rp', '').trim()})`
					: `⚠️ TEKOR (-Rp ${formatCurrency(Math.abs(cashDifference)).replace('Rp', '').trim()})`;

		const text = 
`*LAPORAN TUTUP KASIR (Z-REPORT)*
🏪 *${storeName.toUpperCase()}*
📅 ${dateStr} • Pukul ${timeStr} WIB
👤 Kasir: ${cashierName}
----------------------------------------
*1. RINGKASAN PENJUALAN:*
• Total Omzet: ${formatCurrency(totalGrossSales)} (${todayTransactions.length} Struk)
• Penjualan Tunai: ${formatCurrency(totalCashSales)}
• Penjualan QRIS: ${formatCurrency(totalQrisSales)}
• Penjualan Transfer/Debit: ${formatCurrency(totalTransferSales)}

*2. PENGELUARAN KASIR (PETTY CASH):*
• Total Pengeluaran: -${formatCurrency(totalExpenses)} (${dailyExpenses.length} Pengeluaran)
${dailyExpenses.slice(0, 5).map(e => `  - ${e.category}: ${formatCurrency(e.amount)} (${e.notes || '-'})`).join('\n')}
${dailyExpenses.length > 5 ? `  - ...dan ${dailyExpenses.length - 5} lainnya` : ''}

*3. REKONSILIASI KAS LACI:*
• Modal Awal Laci: ${formatCurrency(startingCash)}
• Penjualan Tunai: +${formatCurrency(totalCashSales)}
• Pengeluaran Kasir: -${formatCurrency(totalExpenses)}
----------------------------------------
*Wajib Ada di Laci: ${formatCurrency(expectedDrawerCash)}*
*Uang Fisik Dihitung: ${countedPhysicalCash !== null ? formatCurrency(countedPhysicalCash) : 'Belum dihitung'}*
*Status Selisih: ${diffText}*
----------------------------------------
_Laporan otomatis dari Sistem POS Toko Aneka Rasa 99._`;

		const cleanPhone = ownerWhatsApp.replace(/\D/g, '').replace(/^0/, '62');
		const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
		window.open(url, '_blank');
	}

	function handleResetShift() {
		if (confirm('Apakah Anda yakin ingin menyelesaikan shift ini dan mereset catatan kasir untuk shift baru? Pastikan struk dan laporan WA sudah terkirim ke Owner.')) {
			dailyExpenses = [];
			todayTransactions = [];
			countedPhysicalCash = null;
			if (typeof window !== 'undefined') {
				localStorage.removeItem('aneka_pos_expenses');
				localStorage.removeItem('aneka_pos_today_tx');
			}
			showClosingModal = false;
			alert('Shift berhasil diselesaikan! Catatan laci kasir telah bersih untuk kasir berikutnya.');
		}
	}

	// ==========================================
	// 🔔 NOTIFIKASI POS & SHOPEE REAL-TIME ENGINE
	// ==========================================
	interface PosNotificationSettings {
		soundEnabled: boolean;
		volume: number; // 10 - 100
		notifyTransaction: boolean;
		notifyShopee: boolean;
		autoDismissSeconds: number; // 3, 6, 10, or 0 (manual)
	}

	interface PosAppNotification {
		id: string;
		type: 'TRANSACTION' | 'SHOPEE';
		title: string;
		message: string;
		orderSn?: string;
		receiptNumber?: string;
		amount?: number;
		shippingCarrier?: string;
		buyerUsername?: string;
		time: string;
		read: boolean;
	}

	let showNotificationModal = $state(false);
	let notificationSettings = $state<PosNotificationSettings>({
		soundEnabled: true,
		volume: 80,
		notifyTransaction: true,
		notifyShopee: true,
		autoDismissSeconds: 6
	});

	let activeToasts = $state<PosAppNotification[]>([]);
	let notificationHistory = $state<PosAppNotification[]>([
		{
			id: 'notif-initial-shopee',
			type: 'SHOPEE',
			title: '🛒 Pesanan Shopee Masuk!',
			message: 'Pesanan #240914SP99281 oleh budi_hartono',
			orderSn: '240914SP99281',
			buyerUsername: 'budi_hartono',
			shippingCarrier: 'SPX Express',
			amount: 85000,
			time: '10:30',
			read: true
		}
	]);

	let unreadNotifCount = $derived(
		notificationHistory.filter(n => !n.read).length
	);

	let shopeePollingInterval: any = null;
	let audioCtx: AudioContext | null = null;

	function getAudioContext(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!audioCtx) {
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioContextClass) {
				audioCtx = new AudioContextClass();
			}
		}
		if (audioCtx && audioCtx.state === 'suspended') {
			audioCtx.resume();
		}
		return audioCtx;
	}

	function playTransactionSuccessSound() {
		if (!notificationSettings.soundEnabled) return;
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const now = ctx.currentTime;
			const masterGain = ctx.createGain();
			masterGain.gain.setValueAtTime((notificationSettings.volume / 100) * 0.25, now);
			masterGain.connect(ctx.destination);

			// Note 1: E5 (659.25 Hz)
			const osc1 = ctx.createOscillator();
			osc1.type = 'sine';
			osc1.frequency.setValueAtTime(659.25, now);
			osc1.connect(masterGain);
			osc1.start(now);
			osc1.stop(now + 0.12);

			// Note 2: G5 (783.99 Hz)
			const osc2 = ctx.createOscillator();
			osc2.type = 'sine';
			osc2.frequency.setValueAtTime(783.99, now + 0.1);
			osc2.connect(masterGain);
			osc2.start(now + 0.1);
			osc2.stop(now + 0.22);

			// Note 3: C6 (1046.50 Hz) - Crisp finish
			const osc3 = ctx.createOscillator();
			osc3.type = 'triangle';
			osc3.frequency.setValueAtTime(1046.5, now + 0.2);
			osc3.connect(masterGain);
			osc3.start(now + 0.2);
			osc3.stop(now + 0.45);
		} catch (e) {
			console.warn('Audio playback error', e);
		}
	}

	function playShopeeOrderSound() {
		if (!notificationSettings.soundEnabled) return;
		try {
			const ctx = getAudioContext();
			if (!ctx) return;
			const now = ctx.currentTime;
			const masterGain = ctx.createGain();
			masterGain.gain.setValueAtTime((notificationSettings.volume / 100) * 0.35, now);
			masterGain.connect(ctx.destination);

			// Shopee Alert Chime: Double frequency tone
			// Tone 1: 880 Hz (A5)
			const osc1 = ctx.createOscillator();
			osc1.type = 'sine';
			osc1.frequency.setValueAtTime(880, now);
			osc1.connect(masterGain);
			osc1.start(now);
			osc1.stop(now + 0.16);

			// Tone 2: 1318.51 Hz (E6)
			const osc2 = ctx.createOscillator();
			osc2.type = 'sine';
			osc2.frequency.setValueAtTime(1318.51, now + 0.16);
			osc2.connect(masterGain);
			osc2.start(now + 0.16);
			osc2.stop(now + 0.45);

			masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
		} catch (e) {
			console.warn('Shopee audio error', e);
		}
	}

	function addAppNotification(notif: {
		type: 'TRANSACTION' | 'SHOPEE';
		title: string;
		message: string;
		orderSn?: string;
		receiptNumber?: string;
		amount?: number;
		shippingCarrier?: string;
		buyerUsername?: string;
	}) {
		const newNotif: PosAppNotification = {
			...notif,
			id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
			read: false
		};

		notificationHistory = [newNotif, ...notificationHistory.slice(0, 49)];
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('aneka_pos_notifications', JSON.stringify(notificationHistory));
			} catch {}
		}

		if (
			(notif.type === 'TRANSACTION' && notificationSettings.notifyTransaction) ||
			(notif.type === 'SHOPEE' && notificationSettings.notifyShopee)
		) {
			activeToasts = [newNotif, ...activeToasts.slice(0, 2)];

			if (notif.type === 'TRANSACTION') {
				playTransactionSuccessSound();
			} else if (notif.type === 'SHOPEE') {
				playShopeeOrderSound();
			}

			if (notificationSettings.autoDismissSeconds > 0) {
				const autoId = newNotif.id;
				setTimeout(() => {
					dismissToast(autoId);
				}, notificationSettings.autoDismissSeconds * 1000);
			}
		}
	}

	function dismissToast(id: string) {
		activeToasts = activeToasts.filter(t => t.id !== id);
	}

	function markAllNotificationsRead() {
		notificationHistory = notificationHistory.map(n => ({ ...n, read: true }));
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('aneka_pos_notifications', JSON.stringify(notificationHistory));
			} catch {}
		}
	}

	function clearNotificationHistory() {
		notificationHistory = [];
		if (typeof window !== 'undefined') {
			localStorage.removeItem('aneka_pos_notifications');
		}
	}

	function saveNotificationSettings() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('aneka_pos_notification_settings', JSON.stringify(notificationSettings));
			} catch {}
		}
	}

	let isSimulatingShopee = $state(false);
	async function simulateShopeeOrderDirectly() {
		isSimulatingShopee = true;
		try {
			const res = await fetch('/api/shopee/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'simulate' })
			});
			const data = await res.json();
			if (data.success && data.order) {
				addAppNotification({
					type: 'SHOPEE',
					title: '🛒 Pesanan Shopee Masuk!',
					message: `Pesanan #${data.order.order_sn} oleh ${data.order.buyer_username}`,
					orderSn: data.order.order_sn,
					buyerUsername: data.order.buyer_username,
					shippingCarrier: data.order.shipping_carrier,
					amount: data.order.total_amount
				});
			} else {
				const mockSn = `240914SP${Math.floor(100000 + Math.random() * 900000)}`;
				addAppNotification({
					type: 'SHOPEE',
					title: '🛒 Pesanan Shopee Masuk!',
					message: `Pesanan #${mockSn} oleh aneka_lover_bangka`,
					orderSn: mockSn,
					buyerUsername: 'aneka_lover_bangka',
					shippingCarrier: 'SPX Express',
					amount: 112500
				});
			}
		} catch {
			const mockSn = `240914SP${Math.floor(100000 + Math.random() * 900000)}`;
			addAppNotification({
				type: 'SHOPEE',
				title: '🛒 Pesanan Shopee Masuk!',
				message: `Pesanan #${mockSn} oleh aneka_lover_bangka`,
				orderSn: mockSn,
				buyerUsername: 'aneka_lover_bangka',
				shippingCarrier: 'SPX Express',
				amount: 112500
			});
		} finally {
			isSimulatingShopee = false;
		}
	}

	let scannerDriver: BarcodeScannerListener | null = null;
	let qrisPollInterval: any = null;

	function closeQRISModal() {
		showQRISModal = false;
		if (qrisPollInterval) {
			clearInterval(qrisPollInterval);
			qrisPollInterval = null;
		}
	}


	// Quick Pick Catalog State (Simulasi Tanpa Scanner Fisik / Demo)
	let showCatalogModal = $state(false);
	let catalogSearch = $state('');
	let catalogProducts = $state<any[]>([]);
	let isLoadingCatalog = $state(false);
	let posSseSource: EventSource | null = null;

	async function fetchCatalog() {
		isLoadingCatalog = true;
		try {
			const res = await fetch('/api/pos/products', { cache: 'no-store' });
			const data = await res.json();
			catalogProducts = data.products || [];
		} catch (e) {
			console.error(e);
		} finally {
			isLoadingCatalog = false;
		}
	}

	async function openCatalog() {
		catalogSearch = '';
		showCatalogModal = true;
		await fetchCatalog();
	}

	let filteredCatalog = $derived(
		catalogProducts.filter((p) =>
			p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
			(p.barcode && p.barcode.toLowerCase().includes(catalogSearch.toLowerCase())) ||
			(p.category_name && p.category_name.toLowerCase().includes(catalogSearch.toLowerCase()))
		)
	);

	function pickCatalogItem(item: any) {
		handleScan(item.barcode || item.sku);
	}

	// HP Camera Barcode Scanner State (Universal Scanner Menggunakan html5-qrcode)
	let showCameraModal = $state(false);
	let html5QrCode: any = null;
	let cameraError = $state('');

	async function startCameraScan() {
		showCameraModal = true;
		cameraError = '';

		// Cek keamanan protokol (Kamera browser WAJIB HTTPS jika diakses via IP jaringan/HP)
		const isSecure = typeof window !== 'undefined' && (
			window.location.protocol === 'https:' ||
			window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1'
		);

		if (!isSecure) {
			cameraError = 'Aturan Keamanan Browser: Akses kamera pada perangkat HP diblokir oleh Google Chrome & Safari pada koneksi HTTP biasa tanpa sertifikat SSL (http://' + window.location.host + '). Kamera akan otomatis aktif 100% setelah aplikasi di-hosting menggunakan domain HTTPS di Cloudflare. Saat ini, silakan gunakan tombol "Buka Katalog Cepat" untuk simulasi demo kasir!';
			return;
		}

		await tick();

		try {
			const { Html5Qrcode } = await import('html5-qrcode');
			if (html5QrCode) {
				try { await html5QrCode.stop(); } catch {}
			}
			html5QrCode = new Html5Qrcode('camera-reader-box');

			await html5QrCode.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: { width: 250, height: 160 }
				},
				(decodedText: string) => {
					stopCameraScan();
					if (navigator.vibrate) navigator.vibrate(200);
					handleScan(decodedText);
				},
				() => {
					// frame scan loop (ignore empty frames)
				}
			);
		} catch (err: any) {
			console.error('Camera scan error:', err);
			cameraError = 'Gagal mengakses kamera: ' + (err.message || 'Izin kamera ditolak pada perangkat Anda.');
		}
	}

	async function stopCameraScan() {
		if (html5QrCode) {
			try {
				await html5QrCode.stop();
				html5QrCode.clear();
			} catch {}
			html5QrCode = null;
		}
		showCameraModal = false;
		cameraError = '';
	}

	// Nominal tagihan final
	let finalPayTotal = $derived(Math.max(0, $total - pointDiscountAmount));

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function displayActionableError(msg: string, advice: string = 'Periksa kembali data atau panggil supervisor jika kendala berlanjut.') {
		errorMessage = msg;
		errorAdvice = advice;
		showErrorModal = true;
	}

	// State & Handler Format Otomatis Rp dan Titik untuk Nominal Uang Kasir
	let cashInputElement: HTMLInputElement | undefined = $state();
	let cashInputDisplay = $state('');

	// Sinkronisasi otomatis tampilan nominal uang saat $amountPaid berubah (misal dari Pecahan Cepat / Uang Pas)
	$effect(() => {
		if ($amountPaid !== null && $amountPaid !== undefined && $amountPaid > 0) {
			const expected = 'Rp ' + new Intl.NumberFormat('id-ID').format($amountPaid);
			if (cashInputDisplay !== expected) {
				cashInputDisplay = expected;
			}
		} else if (cashInputDisplay !== '') {
			cashInputDisplay = '';
		}
	});

	function handleCashInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const raw = input.value;
		const digits = raw.replace(/\D/g, '');

		if (!digits || digits === '0') {
			$amountPaid = null;
			cashInputDisplay = '';
			input.value = '';
			return;
		}

		const num = parseInt(digits, 10);
		if (num > 999999999) return; // Batasi maksimal 999 juta untuk keamanan

		$amountPaid = num;
		const formatted = 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
		cashInputDisplay = formatted;
		input.value = formatted;
	}

	function handleCashKeyDown(e: KeyboardEvent) {
		if (e.key === 'Backspace') {
			const input = e.target as HTMLInputElement;
			const selStart = input.selectionStart;
			const selEnd = input.selectionEnd;

			// Jika kursor tepat setelah titik/spasi/karakter format, hapus angka sebelum pemisah
			if (selStart !== null && selStart === selEnd && selStart > 0) {
				const charBefore = input.value[selStart - 1];
				if (charBefore === '.' || charBefore === ' ' || charBefore === 'p' || charBefore === 'R') {
					e.preventDefault();
					let targetIdx = selStart - 1;
					while (targetIdx >= 0 && /\D/.test(input.value[targetIdx])) {
						targetIdx--;
					}
					if (targetIdx >= 0) {
						const nextVal = input.value.slice(0, targetIdx) + input.value.slice(targetIdx + 1);
						const digits = nextVal.replace(/\D/g, '');
						if (!digits || digits === '0') {
							$amountPaid = null;
							cashInputDisplay = '';
							input.value = '';
						} else {
							const num = parseInt(digits, 10);
							$amountPaid = num;
							const formatted = 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
							cashInputDisplay = formatted;
							input.value = formatted;
						}
					} else {
						$amountPaid = null;
						cashInputDisplay = '';
						input.value = '';
					}
				}
			}
		}
	}

	function clearCashInput() {
		$amountPaid = null;
		cashInputDisplay = '';
		cashInputElement?.focus();
	}

	// State & Handler Format Otomatis untuk Split Payment Modal
	let splitCashDisplay = $state('');
	let splitNonCashDisplay = $state('');

	$effect(() => {
		if (splitCashAmount > 0) {
			const exp = 'Rp ' + new Intl.NumberFormat('id-ID').format(splitCashAmount);
			if (splitCashDisplay !== exp) splitCashDisplay = exp;
		} else if (splitCashDisplay !== '') {
			splitCashDisplay = '';
		}
	});

	$effect(() => {
		if (splitNonCashAmount > 0) {
			const exp = 'Rp ' + new Intl.NumberFormat('id-ID').format(splitNonCashAmount);
			if (splitNonCashDisplay !== exp) splitNonCashDisplay = exp;
		} else if (splitNonCashDisplay !== '') {
			splitNonCashDisplay = '';
		}
	});

	function handleSplitCashInput(e: Event) {
		const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		splitCashAmount = digits ? parseInt(digits, 10) : 0;
	}

	function handleSplitNonCashInput(e: Event) {
		const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		splitNonCashAmount = digits ? parseInt(digits, 10) : 0;
	}

	// Preset Uang Tunai Cepat
	function setCashAmount(val: number) {
		$paymentMethod = 'CASH';
		$amountPaid = val;
	}

	function setExactCash() {
		$paymentMethod = 'CASH';
		$amountPaid = finalPayTotal;
	}

	// 1. Pindai Barcode (Online-First dengan Local Fallback)
	async function handleScan(codeToScan?: string) {
		const code = (codeToScan || barcode).trim();
		if (!code) return;
		barcode = '';

		// Ambil data terbaru langsung dari database VPS (< 0.5ms) agar update harga & nama dari Inventori langsung aktif
		try {
			const res = await fetch(`/api/pos/scan?barcode=${encodeURIComponent(code)}`, { cache: 'no-store' });
			if (res.ok) {
				const data = await res.json();
				addItem(data.product, data.scanned_unit, data.all_units);
				cacheProductItem(code, data);
				if (data.product?.barcode && data.product.barcode !== code) {
					cacheProductItem(data.product.barcode, data);
				}
				return;
			}
			if (res.status === 404) {
				const errData = await res.json().catch(() => ({}));
				displayActionableError(`Produk Tidak Ditemukan: "${code}"`, errData.message || 'Pastikan barcode atau nama produk sudah terdaftar di Inventori.');
				return;
			}
			throw new Error('Gagal memproses pemindaian di server.');
		} catch (err: any) {
			// HANYA gunakan fallback offline jika browser terputus dari jaringan!
			if (typeof navigator !== 'undefined' && !navigator.onLine) {
				const cached = findLocalProduct(code);
				if (cached) {
					addItem(cached.product, cached.scanned_unit, cached.all_units);
					return;
				}
			}
			displayActionableError(`Gagal Memindai: "${code}"`, err.message || 'Periksa koneksi jaringan atau data produk.');
		}
	}

	// 3. Lookup Member
	async function lookupMember() {
		if (!memberPhoneInput.trim()) return;
		try {
			const res = await fetch(`/api/pos/members?phone=${encodeURIComponent(memberPhoneInput.trim())}`);
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				displayActionableError('Member Tidak Ditemukan', 'Nomor HP belum terdaftar sebagai member toko.');
				return;
			}
			const data = await res.json();
			currentMember = data.member;
			$memberId = data.member.id;
			pointsToRedeem = 0;
			pointDiscountAmount = 0;
		} catch (e: any) {
			displayActionableError('Gagal Mencari Member', e.message);
		}
	}

	function applyPointRedemption() {
		if (!currentMember) return;
		const { pointsUsed, discountAmount } = calculatePointDiscount(pointsToRedeem, $subtotal);
		pointsToRedeem = Math.min(pointsUsed, currentMember.points_balance);
		pointDiscountAmount = discountAmount;
		showMemberModal = false;
	}

	// 4. Generate QRIS Dinamis
	async function openQRIS() {
		if ($cart.length === 0 || finalPayTotal <= 0) {
			displayActionableError('Keranjang Masih Kosong', 'Pilih atau scan produk terlebih dahulu sebelum membuka pembayaran QRIS.');
			return;
		}

		$paymentMethod = 'QRIS';
		showQRISModal = true;
		isQrisSettled = false;

		try {
			const res = await fetch('/api/pos/payment/qris', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: finalPayTotal })
			});

			if (res.ok) {
				const data = await res.json();
				qrisRefId = data.referenceId;
				qrisQRString = data.qrString;
				$paymentRef = data.referenceId;

				// Mulai polling otomatis ke gateway Midtrans setiap 2 detik
				if (qrisPollInterval) clearInterval(qrisPollInterval);
				qrisPollInterval = setInterval(async () => {
					if (!showQRISModal || isQrisSettled || !qrisRefId) {
						if (qrisPollInterval) clearInterval(qrisPollInterval);
						return;
					}
					try {
						const checkRes = await fetch(`/api/pos/payment/qris?reference_id=${encodeURIComponent(qrisRefId)}`);
						if (checkRes.ok) {
							const statusData = await checkRes.json();
							if (statusData.status === 'SETTLED') {
								if (qrisPollInterval) clearInterval(qrisPollInterval);
								isQrisSettled = true;
								playTransactionSuccessSound();
								setTimeout(() => {
									closeQRISModal();
									handleCheckout();
								}, 700);
							}
						}
					} catch {}
				}, 2000);
			}
		} catch (e: any) {
			displayActionableError('Gagal Generate QRIS Dinamis', 'Gunakan metode pembayaran Tunai atau Debit jika gateway sedang offline.');
		}
	}

	async function confirmManualQRISPayment() {
		isQrisSettled = true;
		setTimeout(() => {
			showQRISModal = false;
			handleCheckout();
		}, 400);
	}

	async function simulateQRISPayment() {
		try {
			const res = await fetch('/api/pos/payment/qris', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'simulate_payment', reference_id: qrisRefId })
			});

			if (res.ok) {
				isQrisSettled = true;
				setTimeout(() => {
					showQRISModal = false;
					handleCheckout();
				}, 500);
			}
		} catch (e: any) {
			displayActionableError('Simulasi QRIS Gagal', e.message);
		}
	}

	// 5. Eksekusi Checkout Idempotent & Atomik
	async function handleCheckout() {
		if ($cart.length === 0) return;

		// Validasi Nominal Tunai
		if ($paymentMethod === 'CASH' && ($amountPaid || 0) < finalPayTotal) {
			displayActionableError(
				'Nominal Uang Tunai Kurang',
				`Total tagihan adalah ${formatCurrency(finalPayTotal)}. Uang yang dimasukkan (${formatCurrency($amountPaid || 0)}) belum mencukupi.`
			);
			return;
		}

		$isProcessing = true;
		// Gunakan Idempotency Key yang stabil per sesi checkout (Anti Double-Charge saat retry)
		const idempotencyKey = getOrCreateSessionIdempotencyKey();

		// Susun Payload Pembayaran
		let paymentsList = [];
		if (showSplitModal && splitCashAmount + splitNonCashAmount >= finalPayTotal) {
			if (splitCashAmount > 0) {
				paymentsList.push({
					payment_method: 'CASH',
					amount: splitCashAmount,
					change_given: Math.max(0, splitCashAmount + splitNonCashAmount - finalPayTotal)
				});
			}
			if (splitNonCashAmount > 0) {
				paymentsList.push({
					payment_method: splitNonCashMethod,
					amount: splitNonCashAmount,
					payment_reference: splitNonCashRef || `REF-${Date.now()}`
				});
			}
		} else {
			paymentsList.push({
				payment_method: $paymentMethod,
				amount: $paymentMethod === 'CASH' ? $amountPaid || finalPayTotal : finalPayTotal,
				payment_reference: $paymentRef || null,
				change_given: $paymentMethod === 'CASH' ? Math.max(0, ($amountPaid || 0) - finalPayTotal) : 0
			});
		}

		const payload = {
			idempotency_key: idempotencyKey,
			member_id: currentMember?.id || null,
			points_redeemed: pointsToRedeem,
			points_discount: pointDiscountAmount,
			total_amount: finalPayTotal,
			items: $cart.map((i) => ({ unit_id: i.unit_id, qty: i.qty, price_snapshot: i.price })),
			payments: paymentsList,
			client_timestamp: new Date().toISOString(),
			is_offline_sync: !$isOnline
		};

		receiptItems = $cart.map((item) => ({
			name: item.name,
			qty: item.qty,
			price: item.price
		}));

		try {
			if (!$isOnline) {
				const offlineReceipt = `OFFLINE-${Date.now().toString().slice(-6)}`;
				$lastReceiptNumber = offlineReceipt;
				enqueueOfflineTransaction(payload, offlineReceipt);

				// Kurangi stok di katalog lokal & siarkan event ke tab lain
				deductLocalStock(
					$cart.map((i) => ({ productId: i.id, baseQty: i.qty })),
					offlineReceipt
				);

				completedTxData = {
					receiptNumber: offlineReceipt,
					items: receiptItems,
					subtotal: $subtotal,
					discount: pointDiscountAmount + $discount,
					total: finalPayTotal,
					ppn: $totalPPN,
					paidAmount: $paymentMethod === 'CASH' ? $amountPaid || finalPayTotal : finalPayTotal,
					changeAmount: $paymentMethod === 'CASH' ? Math.max(0, ($amountPaid || 0) - finalPayTotal) : 0
				};
				recordCompletedTransaction({
					receiptNumber: offlineReceipt,
					total: finalPayTotal,
					paymentMethod: $paymentMethod,
					cashAmount: $paymentMethod === 'CASH' ? finalPayTotal : (showSplitModal ? splitCashAmount : 0),
					qrisAmount: $paymentMethod === 'QRIS' ? finalPayTotal : (showSplitModal && splitNonCashMethod === 'QRIS' ? splitNonCashAmount : 0),
					transferAmount: $paymentMethod === 'DEBIT' ? finalPayTotal : (showSplitModal && splitNonCashMethod === 'DEBIT' ? splitNonCashAmount : 0),
					itemsCount: $cart.reduce((sum, item) => sum + item.qty, 0)
				});
				addAppNotification({
					type: 'TRANSACTION',
					title: 'Transaksi Kasir Berhasil',
					message: `No: ${offlineReceipt} sebesar ${formatCurrency(finalPayTotal)} (${$paymentMethod})`,
					receiptNumber: offlineReceipt,
					amount: finalPayTotal
				});
				showSuccessModal = true;
				setTimeout(() => {
					window.print();
				}, 100);
				return;
			}

			const res = await fetch('/api/pos/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.message || 'Gagal memproses transaksi pada database.');
			}

			const data = await res.json();
			$lastReceiptNumber = data.receipt_number;

			// Kurangi stok di katalog lokal kasir & broadcast ke tab admin
			deductLocalStock(
				$cart.map((i) => ({ productId: i.id, baseQty: i.qty })),
				data.receipt_number
			);

			// Siapkan data struk kasir & cetak otomatis ke thermal printer
			completedTxData = {
				receiptNumber: data.receipt_number,
				items: receiptItems,
				subtotal: $subtotal,
				discount: pointDiscountAmount + $discount,
				total: finalPayTotal,
				ppn: $totalPPN,
				paidAmount: $paymentMethod === 'CASH' ? $amountPaid || finalPayTotal : finalPayTotal,
				changeAmount: $paymentMethod === 'CASH' ? Math.max(0, ($amountPaid || 0) - finalPayTotal) : 0
			};
			recordCompletedTransaction({
				receiptNumber: data.receipt_number,
				total: finalPayTotal,
				paymentMethod: $paymentMethod,
				cashAmount: $paymentMethod === 'CASH' ? finalPayTotal : (showSplitModal ? splitCashAmount : 0),
				qrisAmount: $paymentMethod === 'QRIS' ? finalPayTotal : (showSplitModal && splitNonCashMethod === 'QRIS' ? splitNonCashAmount : 0),
				transferAmount: $paymentMethod === 'DEBIT' ? finalPayTotal : (showSplitModal && splitNonCashMethod === 'DEBIT' ? splitNonCashAmount : 0),
				itemsCount: $cart.reduce((sum, item) => sum + item.qty, 0)
			});
			addAppNotification({
				type: 'TRANSACTION',
				title: 'Transaksi Kasir Berhasil',
				message: `No: ${data.receipt_number} sebesar ${formatCurrency(finalPayTotal)} (${$paymentMethod})`,
				receiptNumber: data.receipt_number,
				amount: finalPayTotal
			});
			
			showSuccessModal = true;
			setTimeout(() => {
				try { window.print(); } catch {}
			}, 100);
		} catch (err: any) {
			displayActionableError(
				'Transaksi Ditolak Server',
				err.message.includes('Stok') 
					? `${err.message} Harap kurangi quantity atau ambil stok fisik lain.`
					: err.message
			);
		} finally {
			$isProcessing = false;
			showSplitModal = false;
		}
	}

	function startNewTransaction() {
		showSuccessModal = false;
		resetCart();
		currentMember = null;
		pointDiscountAmount = 0;
		barcodeInput?.focus();
	}

	// Keyboard Shortcuts
	function handleGlobalKeys(e: KeyboardEvent) {
		if (showSuccessModal) {
			if (e.key === 'Enter' || e.key === 'Escape') {
				e.preventDefault();
				startNewTransaction();
				return;
			}
		}
		if (e.key === 'F1') {
			e.preventDefault();
			showHelpModal = !showHelpModal;
		} else if (e.key === 'F2') {
			e.preventDefault();
			barcodeInput?.focus();
		} else if (e.key === 'F4') {
			e.preventDefault();
			showSplitModal = true;
			splitCashAmount = Math.round(finalPayTotal / 2);
			splitNonCashAmount = finalPayTotal - splitCashAmount;
		} else if (e.key === 'F7') {
			e.preventDefault();
			openCatalog();
		} else if (e.key === 'F8') {
			e.preventDefault();
			$paymentMethod = 'CASH';
			setTimeout(() => cashInputElement?.focus(), 50);
		} else if (e.key === 'F9') {
			e.preventDefault();
			showExpenseModal = !showExpenseModal;
		} else if (e.key === 'F10') {
			e.preventDefault();
			openQRIS();
		} else if (e.key === 'F11') {
			e.preventDefault();
			showClosingModal = !showClosingModal;
		} else if (e.key === 'F12') {
			e.preventDefault();
			if ($cart.length > 0) handleCheckout();
		}
	}

	// Sprint 3: Auto-logout (AFK Timer 15 menit)
	let idleTimeout: ReturnType<typeof setTimeout>;
	function resetIdleTimer() {
		if (idleTimeout) clearTimeout(idleTimeout);
		// 15 menit * 60 detik * 1000 = 900.000 ms
		idleTimeout = setTimeout(() => {
			window.location.href = '/logout';
		}, 900000);
	}

	function handleActivity() {
		resetIdleTimer();
	}

	onMount(() => {
		barcodeInput?.focus();

		// Muat data shift & pengeluaran dari localStorage kasir
		if (typeof window !== 'undefined') {
			try {
				const savedExpenses = localStorage.getItem('aneka_pos_expenses');
				if (savedExpenses) {
					dailyExpenses = JSON.parse(savedExpenses);
				}
				const savedTodayTx = localStorage.getItem('aneka_pos_today_tx');
				if (savedTodayTx) {
					todayTransactions = JSON.parse(savedTodayTx);
				}
				const savedStartingCash = localStorage.getItem('aneka_pos_starting_cash');
				if (savedStartingCash) {
					startingCash = Number(savedStartingCash) || 200000;
				}
				const savedOwnerWa = localStorage.getItem('aneka_pos_owner_wa');
				if (savedOwnerWa) {
					ownerWhatsApp = savedOwnerWa;
				}
				const savedSettings = localStorage.getItem('aneka_pos_notification_settings');
				if (savedSettings) {
					try { notificationSettings = { ...notificationSettings, ...JSON.parse(savedSettings) }; } catch {}
				}
				const savedNotifs = localStorage.getItem('aneka_pos_notifications');
				if (savedNotifs) {
					try { notificationHistory = JSON.parse(savedNotifs); } catch {}
				}
			} catch (e) {
				console.error('Error reading localStorage shift data', e);
			}

			// Sinkronkan data shift hari ini & seluruh katalog produk dari database VPS
			fetchTodayShiftData();
			fetchCatalog();
		}

		// Bersihkan keranjang otomatis jika ada sisa data dummy / non-UUID dari sesi lama
		const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		cart.update((items) => items.filter((item) => UUID_REGEX.test(item.unit_id)));

		scannerDriver = new BarcodeScannerListener({
			minChars: 3,
			maxIntervalMs: 45,
			onScan: (code) => {
				handleScan(code);
			}
		});
		scannerDriver.attach();
		
		// Initialize idle timer
		resetIdleTimer();

		// Sinkronisasi Real-Time SSE: Segarkan katalog ketika ada produk/stok baru & dengarkan notifikasi
		if (typeof window !== 'undefined' && 'EventSource' in window) {
			try {
				posSseSource = new EventSource('/api/realtime/events');
				posSseSource.addEventListener('STOCK_CHANGED', (event: MessageEvent) => {
					fetchCatalog();
					try {
						const payload = JSON.parse(event.data);
						if (payload?.items) {
							updateLocalStockBalance(payload.items);
						}
					} catch {}
				});

				// Transaksi Berhasil dari SSE (Terminal lain atau background sync)
				posSseSource.addEventListener('TRANSACTION_COMPLETED', (event: MessageEvent) => {
					try {
						const payload = JSON.parse(event.data);
						if (completedTxData?.receiptNumber === payload.receiptNumber) return;
						addAppNotification({
							type: 'TRANSACTION',
							title: 'Transaksi Kasir Berhasil',
							message: payload.message || `No: ${payload.receiptNumber} sebesar ${formatCurrency(payload.totalAmount)}`,
							receiptNumber: payload.receiptNumber,
							amount: payload.totalAmount
						});
					} catch {}
				});

				// Pesanan Shopee Masuk dari SSE
				posSseSource.addEventListener('SHOPEE_ORDER_RECEIVED', (event: MessageEvent) => {
					try {
						const payload = JSON.parse(event.data);
						addAppNotification({
							type: 'SHOPEE',
							title: '🛒 Pesanan Shopee Masuk!',
							message: payload.message || `Pesanan #${payload.orderSn} oleh ${payload.buyerUsername}`,
							orderSn: payload.orderSn,
							buyerUsername: payload.buyerUsername,
							shippingCarrier: payload.shippingCarrier,
							amount: payload.totalAmount
						});
					} catch {}
				});
			} catch {}
		}

		// Fallback Poller untuk mendeteksi pesanan Shopee baru (jika koneksi SSE sempat drop)
		let lastKnownShopeeSn = '';
		shopeePollingInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/shopee/orders?status=READY_TO_SHIP');
				if (!res.ok) return;
				const data = await res.json();
				if (data.success && data.orders && data.orders.length > 0) {
					const latest = data.orders[0];
					if (lastKnownShopeeSn && latest.order_sn !== lastKnownShopeeSn) {
						addAppNotification({
							type: 'SHOPEE',
							title: '🛒 Pesanan Shopee Masuk!',
							message: `Pesanan #${latest.order_sn} (${latest.buyer_username}) • ${latest.shipping_carrier || 'SPX'}`,
							orderSn: latest.order_sn,
							buyerUsername: latest.buyer_username,
							shippingCarrier: latest.shipping_carrier,
							amount: latest.total_amount
						});
					}
					lastKnownShopeeSn = latest.order_sn;
				}
			} catch {}
		}, 15000);
	});

	onDestroy(() => {
		scannerDriver?.detach();
		stopCameraScan();
		if (idleTimeout) clearTimeout(idleTimeout);
		if (posSseSource) posSseSource.close();
		if (shopeePollingInterval) clearInterval(shopeePollingInterval);
	});
</script>

<svelte:window 
	onkeydown={(e) => { handleGlobalKeys(e); handleActivity(); }} 
	onmousemove={handleActivity}
	onclick={handleActivity}
/>

<div class="min-h-screen lg:h-screen w-full max-w-full overflow-x-hidden flex flex-col p-2 sm:p-3 gap-2 sm:gap-2.5 bg-slate-100 text-slate-900 selection:bg-blue-600">
	<!-- Top Bar -->
	<header class="pos-panel bg-white px-3 sm:px-4 py-2 flex justify-between items-center z-10 shrink-0 border border-slate-200 shadow-xs gap-2">
		<div class="flex items-center gap-2 sm:gap-3 min-w-0">
			<a href="/portal" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shrink-0" title="Kembali ke Pusat Kendali (Pilih Modul)">
				<ArrowLeft class="w-4 h-4" />
			</a>
			<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300 shadow-xs shrink-0" />
			<div class="min-w-0">
				<h1 class="text-xs sm:text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
					<span class="truncate">{storeName}</span>
					{#if $isOnline}
						<span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-bold shrink-0">
							<Wifi class="w-2.5 h-2.5 text-emerald-600" /> <span class="hidden sm:inline">Online (VPS Lokal)</span>
						</span>
					{:else}
						<span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-bold shrink-0">
							<WifiOff class="w-2.5 h-2.5 text-amber-600" /> <span class="hidden sm:inline">Offline Mode</span>
						</span>
					{/if}
				</h1>
				<p class="text-[9px] sm:text-[10px] text-slate-500 font-mono hidden sm:block">Terminal POS Kasir • Local-First Engine</p>
			</div>
		</div>

		<!-- Right Shortcuts & Profile -->
		<div class="flex items-center gap-1.5 sm:gap-2.5 text-xs shrink-0">
			<!-- Tombol 1: Catat Pengeluaran Toko (Petty Cash) -->
			<button
				onclick={() => (showExpenseModal = true)}
				class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-all font-semibold shadow-xs cursor-pointer active:scale-95"
				title="Catat Pengeluaran Toko / Kasir Petty Cash (F9)"
			>
				<Wallet class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
				<div class="text-left">
					<span class="text-[8px] text-amber-700 font-mono block leading-none">KAS KELUAR</span>
					<span class="text-[10px] sm:text-xs font-bold leading-tight block">Pengeluaran</span>
				</div>
				{#if dailyExpenses.length > 0}
					<span class="ml-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] bg-amber-600 text-white rounded-full font-bold">
						{dailyExpenses.length}
					</span>
				{/if}
			</button>

			<!-- Tombol 2: Tutup Kasir / Rekap Harian (Z-Report Shift) -->
			<button
				onclick={() => (showClosingModal = true)}
				class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 transition-all font-semibold shadow-xs cursor-pointer active:scale-95"
				title="Tutup Kasir / Rekap Harian Shift Z-Report (F11)"
			>
				<FileSpreadsheet class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
				<div class="text-left">
					<span class="text-[8px] text-blue-700 font-mono block leading-none">Z-REPORT</span>
					<span class="text-[10px] sm:text-xs font-bold leading-tight block">Tutup Kasir</span>
				</div>
			</button>

			<!-- Tombol 3: Pengaturan Notifikasi & Suara Bel (Shopee & POS) -->
			<button
				onclick={() => {
					showNotificationModal = true;
					markAllNotificationsRead();
				}}
				class="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded border transition-all font-semibold shadow-xs cursor-pointer active:scale-95 {unreadNotifCount > 0
					? 'border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-900 ring-2 ring-orange-300'
					: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'}"
				title="Pengaturan Notifikasi Suara Bel & Pop-up POS & Shopee"
			>
				{#if notificationSettings.soundEnabled}
					<BellRing class="w-3.5 h-3.5 sm:w-4 sm:h-4 {unreadNotifCount > 0 ? 'text-orange-600 animate-bounce' : 'text-blue-600'} shrink-0" />
				{:else}
					<BellOff class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
				{/if}
				<div class="text-left hidden sm:block">
					<span class="text-[8px] text-slate-500 font-mono block leading-none">SUARA & BEL</span>
					<span class="text-[10px] sm:text-xs font-bold leading-tight block">Notifikasi</span>
				</div>
				{#if unreadNotifCount > 0}
					<span class="ml-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] bg-red-600 text-white rounded-full font-bold animate-pulse">
						{unreadNotifCount}
					</span>
				{/if}
			</button>


			<div class="flex items-center gap-1.5 sm:gap-2 border-l border-slate-300 pl-2 sm:pl-3">
				<div class="w-7 h-7 rounded-lg {isOwner ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-700 border border-slate-300'} flex items-center justify-center font-bold text-xs shrink-0">
					{(cashierName || 'U').charAt(0).toUpperCase()}
				</div>
				<div class="text-left min-w-0">
					<span class="text-[8px] sm:text-[9px] font-mono font-bold block leading-none {isOwner ? 'text-blue-700' : 'text-slate-500'}">
						{isOwner ? 'PEMILIK (OWNER)' : 'KASIR'}
					</span>
					<span class="font-bold text-[11px] sm:text-xs text-slate-900 max-w-[90px] sm:max-w-[150px] truncate block leading-tight mt-0.5" title={cashierName}>
						{cashierName}
					</span>
				</div>
			</div>

			<button
				onclick={() => (showHelpModal = true)}
				class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded text-slate-700 transition-colors font-medium cursor-pointer"
				title="Bantuan POS (F1)"
			>
				<HelpCircle class="w-3.5 h-3.5 text-blue-600" />
				<span class="kbd-badge">F1</span>
			</button>
		</div>
	</header>

	<!-- Main Cashier Workspace -->
	<main class="flex-1 flex flex-col lg:flex-row gap-2.5 overflow-y-auto lg:overflow-hidden min-h-0">
		<!-- Left: Barcode Scanner & Cart Ticket Tape -->
		<section class="flex-1 flex flex-col gap-2 min-w-0">
			<!-- Scanner Bar -->
			<div class="pos-panel p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shrink-0 bg-white border-slate-200">
				<div class="bg-blue-50 p-2 rounded border border-blue-200 text-blue-600 shrink-0">
					<Barcode class="w-5 h-5" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-1.5 mb-0.5">
						<label for="pos-barcode" class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">PINDAI BARCODE</label>
						<span class="kbd-badge hidden sm:inline-block">F2</span>
					</div>
					<input
						id="pos-barcode"
						bind:this={barcodeInput}
						bind:value={barcode}
						onkeydown={(e) => e.key === 'Enter' && handleScan()}
						type="text"
						placeholder="Arahkan scanner / ketik barcode..."
						class="w-full bg-transparent text-base sm:text-lg font-bold outline-none text-slate-900 placeholder-slate-400 font-mono tracking-wide"
					/>
				</div>
				<div class="flex items-center gap-1.5 shrink-0">
					<button
						onclick={() => handleScan()}
						class="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
						title="Tambah manual via input"
					>
						+ TAMBAH
					</button>

					<button
						onclick={openCatalog}
						class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 px-2.5 sm:px-3 py-2 rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
						title="Buka Katalog Cepat (F7)"
					>
						<Package class="w-4 h-4 text-purple-600" />
						<span class="hidden sm:inline">Katalog</span>
						<span class="kbd-badge hidden sm:inline-block">F7</span>
					</button>

					<button
						onclick={startCameraScan}
						class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-2.5 py-2 rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
						title="Pindai barcode langsung via kamera HP"
					>
						<Camera class="w-4 h-4 text-emerald-600" />
						<span class="hidden sm:inline">Kamera</span>
					</button>
				</div>
			</div>

			<!-- Cart Tape Table -->
			<div class="pos-panel flex-1 flex flex-col overflow-hidden bg-white border-slate-200 min-h-[260px] lg:min-h-0">
				<div class="flex-1 overflow-x-auto overflow-y-auto p-2 sm:p-3 custom-scrollbar">
					<table class="w-full min-w-[480px] sm:min-w-full text-left text-xs border-collapse">
						<thead>
							<tr class="text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-[10px] font-mono">
								<th class="py-2.5 px-3 font-bold">NAMA PRODUK</th>
								<th class="py-2.5 px-3 font-bold text-center w-20">QTY</th>
								<th class="py-2.5 px-3 font-bold text-center w-28">SATUAN</th>
								<th class="py-2.5 px-3 font-bold text-right w-28">HARGA</th>
								<th class="py-2.5 px-3 font-bold text-right w-32">SUBTOTAL</th>
								<th class="py-2.5 px-3 font-bold text-center w-8"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each $cart as item, index (item.id)}
								<tr class="hover:bg-slate-50 transition-colors">
									<td class="py-2 px-3 font-bold text-slate-900 text-xs">{item.name}</td>
									<td class="py-2 px-3 text-center">
										<input
											type="number"
											min="1"
											value={item.qty}
											oninput={(e) => updateQty(index, Number(e.currentTarget.value))}
											class="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold outline-none focus:border-blue-600 text-xs text-slate-900"
										/>
									</td>
									<td class="py-2 px-3 text-center">
										<select
											value={item.unit_id}
											onchange={(e) => updateUnit(index, e.currentTarget.value)}
											class="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs outline-none focus:border-blue-600 text-slate-800"
										>
											{#each item.available_units as unit}
												<option value={unit.id}>{unit.unit_name} (x{unit.conversion_factor})</option>
											{/each}
										</select>
									</td>
									<td class="py-2 px-3 text-right font-mono text-slate-600 text-xs">{formatCurrency(item.price)}</td>
									<td class="py-2 px-3 text-right font-mono font-black text-blue-700 text-xs">
										{formatCurrency(item.qty * item.price)}
									</td>
									<td class="py-2 px-3 text-center">
										<button
											onclick={() => removeItem(index)}
											class="text-red-500 hover:text-red-700 transition-colors p-1"
											title="Hapus Baris"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="py-16 sm:py-20 text-center text-slate-400">
										<ShoppingCart class="w-10 h-10 mx-auto mb-2 text-slate-300" />
										Keranjang belanja masih kosong.<br />
										<span class="text-[11px] text-slate-500">Pindai barcode atau tekan F2 untuk memasukkan item.</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="p-2.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-600">
					<span>Total Item: <b class="text-slate-900">{$cart.reduce((s, i) => s + i.qty, 0)} Pcs</b> ({$cart.length} Jenis)</span>
					{#if $cart.length > 0}
						<button onclick={resetCart} class="text-red-600 hover:text-red-800 text-[11px] flex items-center gap-1 font-bold">
							<Trash2 class="w-3 h-3" /> Kosongkan Keranjang
						</button>
					{/if}
				</div>
			</div>
		</section>

		<!-- Right: Payment & Summary -->
		<aside class="w-full lg:w-96 flex flex-col shrink-0">
			<div class="pos-panel p-3.5 sm:p-4 flex flex-col gap-3 flex-1 bg-white border-slate-200">
				<!-- Total Bill Screen Header -->
				<div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
					<div class="flex justify-between items-center text-xs text-slate-600">
						<span>Subtotal ({$cart.reduce((s, i) => s + i.qty, 0)} item):</span>
						<span class="font-mono text-slate-900">{formatCurrency($subtotal)}</span>
					</div>

					{#if pointDiscountAmount > 0}
						<div class="flex justify-between items-center text-xs text-purple-700">
							<span>Potongan Poin Member:</span>
							<span class="font-mono font-bold">- {formatCurrency(pointDiscountAmount)}</span>
						</div>
					{/if}

					{#if $discount > 0}
						<div class="flex justify-between items-center text-xs text-emerald-700">
							<span>Diskon Member Toko:</span>
							<span class="font-mono font-bold">- {formatCurrency($discount)}</span>
						</div>
					{/if}

					<div class="border-t border-slate-200 pt-2 flex justify-between items-baseline">
						<span class="text-xs font-bold text-slate-700 uppercase font-mono">TOTAL TAGIHAN</span>
						<span class="font-mono text-3xl font-black text-slate-900 tracking-tight">
							{formatCurrency(finalPayTotal)}
						</span>
					</div>

					<!-- Transparansi Pajak (Include PPN) -->
					{#if $totalPPN > 0}
						<div class="border-t border-slate-200 pt-1.5 flex flex-col gap-0.5 mt-1">
							<div class="flex justify-between items-center text-[10px] text-slate-400 font-mono">
								<span>DPP (Dasar Pengenaan Pajak):</span>
								<span>{formatCurrency($totalDPP)}</span>
							</div>
							<div class="flex justify-between items-center text-[10px] text-slate-400 font-mono">
								<span>PPN 11% (Termasuk dalam harga):</span>
								<span>{formatCurrency($totalPPN)}</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- Payment Selection -->
				<div class="space-y-2">
					<div class="flex justify-between items-center">
						<span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">METODE PEMBAYARAN</span>
						<button
							onclick={() => {
								showSplitModal = true;
								splitCashAmount = Math.round(finalPayTotal / 2);
								splitNonCashAmount = finalPayTotal - splitCashAmount;
							}}
							class="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
						>
							<Layers class="w-3 h-3" /> <span class="kbd-badge">F4</span> Split Pay
						</button>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={() => {
								$paymentMethod = 'CASH';
								setTimeout(() => cashInputElement?.focus(), 50);
							}}
							class="border rounded-lg py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer {$paymentMethod === 'CASH'
								? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
								: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'}"
						>
							<Banknote class="w-5 h-5" />
							<span class="text-xs font-bold">TUNAI</span>
							<span class="kbd-badge">F8</span>
						</button>

						<button
							onclick={openQRIS}
							class="border rounded-lg py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer {$paymentMethod === 'QRIS'
								? 'bg-purple-600 text-white border-purple-600 shadow-sm'
								: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'}"
						>
							<QrCode class="w-5 h-5" />
							<span class="text-xs font-bold">QRIS</span>
							<span class="kbd-badge">F10</span>
						</button>
					</div>

					<!-- Tunai Quick Presets -->
					{#if $paymentMethod === 'CASH'}
						<div class="space-y-1.5 pt-1">
							<div class="flex items-center justify-between text-[10px] text-slate-600 font-mono">
								<span>PECAHAN CEPAT:</span>
								<button onclick={setExactCash} class="text-emerald-700 font-bold hover:underline">
									Uang Pas ({formatCurrency(finalPayTotal)})
								</button>
							</div>

							<div class="grid grid-cols-4 gap-1">
								<button onclick={() => setCashAmount(20000)} class="py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded text-[11px] font-mono text-slate-800 font-bold">20k</button>
								<button onclick={() => setCashAmount(50000)} class="py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded text-[11px] font-mono text-slate-800 font-bold">50k</button>
								<button onclick={() => setCashAmount(100000)} class="py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded text-[11px] font-mono text-slate-800 font-bold">100k</button>
								<button onclick={() => setCashAmount(200000)} class="py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded text-[11px] font-mono text-slate-800 font-bold">200k</button>
							</div>

							<div class="relative">
								<input
									bind:this={cashInputElement}
									type="text"
									inputmode="numeric"
									value={cashInputDisplay}
									oninput={handleCashInput}
									onkeydown={handleCashKeyDown}
									placeholder="Ketik nominal uang..."
									class="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-3 pr-9 text-lg font-mono font-bold outline-none focus:border-emerald-600 focus:bg-white text-slate-900 transition-colors"
								/>
								{#if cashInputDisplay}
									<button
										type="button"
										onclick={clearCashInput}
										class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 text-xs transition-colors"
										title="Hapus nominal"
									>
										✕
									</button>
								{/if}
							</div>

							<div class="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
								<span class="text-xs text-emerald-800 font-bold">UANG KEMBALIAN:</span>
								<span class="font-mono text-emerald-700 font-black text-lg">
									{formatCurrency(Math.max(0, ($amountPaid || 0) - finalPayTotal))}
								</span>
							</div>
						</div>
					{:else if $paymentMethod === 'DEBIT'}
						<div class="pt-1 space-y-1">
							<label for="pos-debit-ref" class="text-[10px] text-slate-600 font-mono block">NOMOR STRUK EDC / REFERENSI</label>
							<input
								id="pos-debit-ref"
								type="text"
								bind:value={$paymentRef}
								placeholder="Contoh: EDC-BCA-987654"
								class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-blue-600 text-slate-900"
							/>
						</div>
					{/if}
				</div>

				<!-- Checkout Button (F12) -->
				<button
					onclick={handleCheckout}
					disabled={$isProcessing || $cart.length === 0}
					class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-auto"
				>
					<Printer class="w-4 h-4" />
					<span>{$isProcessing ? 'MEMPROSES...' : 'BAYAR & CETAK STRUK'}</span>
					<span class="bg-black/20 text-[10px] px-1.5 py-0.5 rounded font-mono ml-1">F12</span>
				</button>
			</div>
		</aside>
	</main>
</div>

<!-- Actionable Error Modal Dialog (Menggantikan Alert Browser) -->
{#if showErrorModal}
	<div class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-red-300 w-full max-w-md p-6 space-y-4 shadow-2xl">
			<div class="flex items-start gap-3">
				<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
					<AlertTriangle class="w-6 h-6" />
				</div>
				<div class="space-y-1">
					<h3 class="font-bold text-slate-900 text-base">{errorMessage}</h3>
					<p class="text-xs text-slate-600 leading-relaxed">{errorAdvice}</p>
				</div>
			</div>

			<div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
				<button
					onclick={() => {
						showErrorModal = false;
						barcodeInput?.focus();
					}}
					class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-xs transition-colors"
				>
					Saya Mengerti & Lanjutkan
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Transaksi Berhasil & Ringkasan Kembalian Kasir -->
{#if showSuccessModal && completedTxData}
	<div class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-emerald-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex flex-col items-center justify-center text-center space-y-1">
				<div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
					<CheckCircle2 class="w-8 h-8" />
				</div>
				<h3 class="font-black text-slate-900 text-xl">Transaksi Berhasil!</h3>
				<p class="text-xs text-slate-500 font-mono">No. Struk: {completedTxData.receiptNumber}</p>
				<p class="text-[11px] text-emerald-700 font-medium">🖨️ Struk sedang dicetak ke printer thermal...</p>
			</div>

			<div class="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2.5 font-mono">
				<div class="flex justify-between items-center text-xs">
					<span class="text-slate-600">Metode Pembayaran:</span>
					<span class="font-bold text-slate-900 uppercase">{$paymentMethod}</span>
				</div>
				<div class="flex justify-between items-center text-xs">
					<span class="text-slate-600">Total Tagihan:</span>
					<span class="font-bold text-slate-900">{formatCurrency(completedTxData.total)}</span>
				</div>
				<div class="flex justify-between items-center text-xs">
					<span class="text-slate-600">Uang Diterima:</span>
					<span class="font-bold text-slate-900">{formatCurrency(completedTxData.paidAmount)}</span>
				</div>
				<div class="flex justify-between items-center pt-2 border-t border-slate-300">
					<span class="text-xs font-bold text-emerald-800">UANG KEMBALIAN:</span>
					<span class="text-2xl font-black text-emerald-600">{formatCurrency(completedTxData.changeAmount)}</span>
				</div>
			</div>

			<div class="flex gap-2 pt-1">
				<button
					onclick={() => window.print()}
					class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
				>
					<Printer class="w-4 h-4 text-slate-600" /> Cetak Ulang Struk
				</button>
				<button
					onclick={startNewTransaction}
					class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
				>
					Transaksi Baru (Enter)
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Member (F3) -->
{#if showMemberModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<Award class="w-4 h-4 text-purple-600" />
					Member & Akumulasi Poin
				</h3>
				<button onclick={() => (showMemberModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<div class="space-y-3 text-xs">
				<div>
					<label for="modal-member-phone" class="block text-slate-600 mb-1 font-mono text-[11px]">NOMOR HP MEMBER</label>
					<div class="flex gap-2">
						<input
							id="modal-member-phone"
							type="text"
							bind:value={memberPhoneInput}
							placeholder="Contoh: 081299887766"
							class="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-purple-600 text-slate-900 font-mono"
						/>
						<button onclick={lookupMember} class="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-lg font-bold">
							Cari
						</button>
					</div>
				</div>

				{#if currentMember}
					<div class="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1 font-mono text-[11px]">
						<div class="flex justify-between"><span class="text-slate-600">Nama:</span><b class="text-slate-900">{currentMember.name}</b></div>
						<div class="flex justify-between"><span class="text-slate-600">Poin Aktif:</span><b class="text-emerald-700">{currentMember.points_balance} Poin</b></div>
					</div>

					<div class="space-y-1.5 pt-2 border-t border-slate-200">
						<label for="modal-points-redeem" class="block text-slate-600 text-[11px]">Tukar Poin Jadi Potongan Belanja (10 Poin = Rp 100):</label>
						<input
							id="modal-points-redeem"
							type="number"
							min="0"
							max={currentMember.points_balance}
							step="10"
							bind:value={pointsToRedeem}
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
						/>
						<p class="text-[11px] text-purple-800 font-mono">
							Potongan: <b>{formatCurrency(pointsToRedeem * 10)}</b>
						</p>
					</div>
				{/if}

				<div class="pt-2 flex justify-end gap-2">
					<button onclick={() => (showMemberModal = false)} class="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Tutup
					</button>
					{#if currentMember}
						<button onclick={applyPointRedemption} class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg font-bold">
							Gunakan Poin
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Split Payment (F4) -->
{#if showSplitModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<Layers class="w-4 h-4 text-blue-600" />
					Split Payment (Bagi Pembayaran)
				</h3>
				<button onclick={() => (showSplitModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-200">
					<span class="text-slate-600 font-mono">TOTAL TAGIHAN:</span>
					<span class="text-base font-black text-slate-900 font-mono">{formatCurrency(finalPayTotal)}</span>
				</div>

				<div class="space-y-1">
					<label for="split-modal-cash" class="block text-slate-600 text-[11px] font-mono">NOMINAL TUNAI (CASH):</label>
					<input id="split-modal-cash" type="text" inputmode="numeric" value={splitCashDisplay} oninput={handleSplitCashInput} placeholder="Rp 0" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold" />
				</div>

				<div class="space-y-1">
					<label for="split-modal-noncash" class="block text-slate-600 text-[11px] font-mono">NOMINAL NON-TUNAI:</label>
					<div class="flex gap-2">
						<select bind:value={splitNonCashMethod} class="bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs">
							<option value="QRIS">QRIS</option>
							<option value="DEBIT">Debit EDC</option>
						</select>
						<input id="split-modal-noncash" type="text" inputmode="numeric" value={splitNonCashDisplay} oninput={handleSplitNonCashInput} placeholder="Rp 0" class="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold" />
					</div>
				</div>

				<div class="pt-2 flex justify-end gap-2">
					<button onclick={() => (showSplitModal = false)} class="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button onclick={handleCheckout} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-bold">
						Bayar Split & Cetak
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal QRIS (F10) -->
{#if showQRISModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-sm max-h-[92vh] overflow-y-auto p-5 text-center space-y-3.5 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
					<QrCode class="w-4 h-4 text-purple-600" />
					Pembayaran QRIS
				</h3>
				<button onclick={closeQRISModal} class="text-slate-400 hover:text-slate-700 text-base cursor-pointer">✕</button>
			</div>

			<!-- Kartu Standar QRIS Indonesia (Cocok untuk QRIS Midtrans / BCA / GoPay / ShopeePay) -->
			<div class="p-3.5 bg-slate-50 border-2 border-dashed border-purple-200 rounded-xl inline-block shadow-xs mx-auto w-full max-w-[260px]">
				<div class="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
					<span class="text-[10px] font-black tracking-wider text-rose-600 font-mono">QRIS</span>
					<span class="text-[9px] font-bold text-slate-700 truncate max-w-[150px]">{storeName}</span>
				</div>
				<div class="w-48 h-48 bg-white border border-slate-300 rounded-lg flex flex-col items-center justify-center mx-auto p-2 shadow-inner relative overflow-hidden">
					{#if qrisQRString}
						<img
							src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={encodeURIComponent(qrisQRString)}"
							alt="Barcode QRIS {formatCurrency(finalPayTotal)}"
							class="w-full h-full object-contain"
						/>
						<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div class="w-7 h-7 bg-white rounded shadow-xs border border-purple-300 flex items-center justify-center">
								<span class="text-[9px] font-black text-purple-700 font-mono">99</span>
							</div>
						</div>
					{:else}
						<QrCode class="w-24 h-24 text-slate-900 animate-pulse" />
					{/if}
				</div>
				<p class="text-[9px] font-mono font-bold text-slate-600 mt-1.5">NMID: ID1020039201920</p>
				<p class="text-[8px] font-mono text-slate-400 truncate">{qrisRefId}</p>
			</div>

			<div>
				<p class="text-[10px] text-slate-500 font-mono font-semibold">TOTAL TAGIHAN</p>
				<p class="text-2xl font-black font-mono text-emerald-700">{formatCurrency(finalPayTotal)}</p>
			</div>

			{#if isQrisSettled}
				<div class="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
					<CheckCircle2 class="w-4 h-4 text-emerald-600" /> Pembayaran Berhasil Dikonfirmasi!
				</div>
			{:else}
				<div class="space-y-2 pt-1">
					<!-- Tombol Konfirmasi Kasir (Untuk QRIS BCA / Merchant Bank / Stiker Meja) -->
					<button
						onclick={confirmManualQRISPayment}
						class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
					>
						<CheckCircle2 class="w-4 h-4" /> Konfirmasi Bayar & Cetak Struk
					</button>

					<!-- Tombol Simulasi Demo (Untuk Presentasi) -->
					<button
						onclick={simulateQRISPayment}
						class="w-full bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-purple-200"
					>
						<Zap class="w-3.5 h-3.5 text-purple-600" /> Mode Demo: Simulasikan Pembeli Scan & Bayar
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Modal Bantuan Shortcut Keyboard (F1) -->
{#if showHelpModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<HelpCircle class="w-4 h-4 text-blue-600" />
					Daftar Shortcut Keyboard Kasir
				</h3>
				<button onclick={() => (showHelpModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<div class="space-y-1.5 text-xs font-mono">
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Bantuan Shortcut:</span><span class="kbd-badge">F1</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Pindai / Ketik Barcode:</span><span class="kbd-badge">F2</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Split Payment (Tunai+Non-Tunai):</span><span class="kbd-badge">F4</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Buka Katalog Cepat (Pilih Barang):</span><span class="kbd-badge text-purple-800 border-purple-300 bg-purple-50">F7</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Pilih Pembayaran Tunai:</span><span class="kbd-badge">F8</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Pilih Pembayaran Debit:</span><span class="kbd-badge">F9</span></div>
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Generate QRIS Dinamis:</span><span class="kbd-badge">F10</span></div>
				<div class="flex justify-between py-1"><span class="text-slate-600">Cetak Struk & Selesai:</span><span class="kbd-badge text-emerald-800 border-emerald-300 bg-emerald-50">F12</span></div>
			</div>

			<div class="pt-2 flex justify-end">
				<button onclick={() => (showHelpModal = false)} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Katalog Cepat Produk (F7) -->
{#if showCatalogModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6 space-y-3 shadow-2xl overflow-hidden">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200 shrink-0">
				<div class="flex items-center gap-2">
					<Package class="w-5 h-5 text-purple-600" />
					<h3 class="font-bold text-slate-900 text-sm sm:text-base">Katalog Cepat Toko Aneka Rasa 99</h3>
				</div>
				<div class="flex items-center gap-2">
					<button
						onclick={fetchCatalog}
						class="text-xs text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1 font-bold cursor-pointer transition-colors"
						title="Segarkan Katalog Produk Terbaru"
					>
						<RefreshCw class="w-3.5 h-3.5 {isLoadingCatalog ? 'animate-spin' : ''}" />
						<span class="hidden sm:inline">Segarkan</span>
					</button>
					<button onclick={() => (showCatalogModal = false)} class="text-slate-400 hover:text-slate-700 text-base cursor-pointer px-1">✕</button>
				</div>
			</div>

			<!-- Search Bar -->
			<div class="relative shrink-0">
				<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					bind:value={catalogSearch}
					placeholder="Ketik nama makanan, kemplang, getas, atau barcode..."
					class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-600 text-slate-900"
				/>
			</div>

			<!-- Products Grid -->
			<div class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[250px]">
				{#if isLoadingCatalog}
					<div class="py-16 text-center text-slate-400 text-xs">Memuat daftar produk...</div>
				{:else if filteredCatalog.length === 0}
					<div class="py-16 text-center text-slate-400 text-xs">Tidak ada produk yang cocok dengan kata kunci.</div>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{#each filteredCatalog as item}
							<button
								onclick={() => pickCatalogItem(item)}
								class="text-left p-2.5 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex justify-between items-center group cursor-pointer"
							>
								<div class="min-w-0 pr-2">
									<p class="font-bold text-slate-900 text-xs group-hover:text-purple-700 truncate">{item.name}</p>
									<div class="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-mono">
										<span>{item.category_name || 'Umum'}</span>
										<span>•</span>
										<span>Stok: {item.stock}</span>
									</div>
								</div>
								<div class="text-right shrink-0">
									<p class="font-bold font-mono text-xs text-purple-700">{formatCurrency(item.price)}</p>
									<span class="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block">+ Tambah</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="pt-2 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
				<span class="text-slate-500 text-[11px]">Klik produk untuk langsung memasukkan ke keranjang kasir.</span>
				<button onclick={() => (showCatalogModal = false)} class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer">
					Selesai
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Scanner Kamera HP -->
{#if showCameraModal}
	<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-sm p-4 space-y-3 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<div class="flex items-center gap-2">
					<Camera class="w-4 h-4 text-emerald-600" />
					<h3 class="font-bold text-slate-900 text-xs">Scan Barcode Kamera HP</h3>
				</div>
				<button onclick={stopCameraScan} class="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
			</div>

			<div class="relative bg-slate-950 rounded-lg overflow-hidden min-h-[220px] flex items-center justify-center border border-slate-700">
				<div id="camera-reader-box" class="w-full h-full"></div>
			</div>

			{#if cameraError}
				<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed space-y-1.5">
					<div class="font-bold flex items-center gap-1.5 text-amber-800">
						<AlertTriangle class="w-3.5 h-3.5 shrink-0" />
						<span>Akses Kamera Dibatasi Browser</span>
					</div>
					<p>{cameraError}</p>
				</div>
			{:else}
				<p class="text-[11px] text-slate-500 text-center font-mono">Arahkan kamera ke garis barcode pada kemasan barang.</p>
			{/if}

			<div class="pt-1 flex gap-2">
				<button onclick={stopCameraScan} class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-xs cursor-pointer">
					Tutup
				</button>
				<button
					onclick={() => {
						stopCameraScan();
						openCatalog();
					}}
					class="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
				>
					<Package class="w-3.5 h-3.5" /> Buka Katalog Cepat
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Catat Pengeluaran Toko (Petty Cash) -->
{#if showExpenseModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-5 space-y-4 shadow-2xl">
			<!-- Modal Header -->
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<div class="flex items-center gap-2">
					<div class="p-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-300">
						<Wallet class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-slate-900 text-sm sm:text-base">Catat Pengeluaran Toko (Petty Cash)</h3>
						<p class="text-[11px] text-slate-500 font-mono">Uang keluar laci kasir untuk kebutuhan toko hari ini</p>
					</div>
				</div>
				<button onclick={() => (showExpenseModal = false)} class="p-1 text-slate-400 hover:text-slate-700 rounded text-base cursor-pointer">✕</button>
			</div>

			<!-- Input Form -->
			<div class="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
				<!-- Kategori Cepat -->
				<div>
					<span class="block text-slate-700 font-bold mb-1.5 text-xs">PILIH KATEGORI PENGELUARAN:</span>
					<div class="flex flex-wrap gap-1.5">
						{#each [
							'Kantong Kresek / Plastik',
							'Galon Air / Minum',
							'Lakban / Solasi Packing',
							'Token Listrik Toko',
							'Konsumsi / Makan Kasir',
							'Bensin / Antar Barang',
							'Lain-lain'
						] as cat}
							<button
								type="button"
								onclick={() => (expenseCategory = cat)}
								class="px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer {expenseCategory === cat
									? 'bg-amber-600 text-white border-amber-700 font-bold shadow-xs'
									: 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100/50'}"
							>
								{cat}
							</button>
						{/each}
					</div>
				</div>

				<!-- Nominal Pengeluaran -->
				<div>
					<div class="flex justify-between items-center mb-1">
						<label for="pos-expense-amount" class="text-slate-700 font-bold text-xs">NOMINAL UANG KELUAR (RP):</label>
						{#if expenseAmount}
							<span class="text-xs font-mono font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
								{formatCurrency(expenseAmount)}
							</span>
						{/if}
					</div>
					<input
						id="pos-expense-amount"
						type="number"
						min="500"
						step="500"
						bind:value={expenseAmount}
						placeholder="Ketik nominal, misal: 25000"
						class="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 font-mono text-base font-bold"
					/>
					<!-- Quick Nominal Chips -->
					<div class="flex flex-wrap gap-1.5 mt-2">
						{#each [5000, 10000, 20000, 50000, 100000] as chip}
							<button
								type="button"
								onclick={() => (expenseAmount = (expenseAmount || 0) + chip)}
								class="px-2 py-0.5 text-[11px] bg-white hover:bg-amber-100 border border-slate-300 text-slate-800 rounded font-mono font-semibold transition-colors cursor-pointer"
							>
								+{formatCurrency(chip).replace('Rp', '').trim()}
							</button>
						{/each}
						<button
							type="button"
							onclick={() => (expenseAmount = null)}
							class="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 rounded font-mono transition-colors cursor-pointer"
						>
							Reset
						</button>
					</div>
				</div>

				<!-- Keterangan -->
				<div>
					<label for="pos-expense-notes" class="block text-slate-700 font-bold mb-1 text-xs">KETERANGAN / CATATAN (OPSIONAL):</label>
					<input
						id="pos-expense-notes"
						type="text"
						bind:value={expenseNotes}
						placeholder="Contoh: Beli 2 pack kresek tebal di agen sebelah"
						class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-600 text-slate-900 text-xs"
					/>
				</div>

				<!-- Submit Button -->
				<button
					onclick={handleAddExpense}
					disabled={isSubmittingExpense || !expenseAmount || expenseAmount <= 0}
					class="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
				>
					<Plus class="w-4 h-4" /> Simpan Pengeluaran Kasir
				</button>
			</div>

			<!-- Riwayat Pengeluaran Hari Ini -->
			<div class="space-y-2 pt-1">
				<div class="flex justify-between items-center">
					<h4 class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
						<span>Riwayat Pengeluaran Hari Ini</span>
						<span class="px-2 py-0.2 text-[10px] bg-slate-100 text-slate-700 border border-slate-300 rounded-full font-bold">
							{dailyExpenses.length} catatan
						</span>
					</h4>
					<span class="font-mono text-xs font-bold text-red-700">
						Total: -{formatCurrency(totalExpenses)}
					</span>
				</div>

				{#if dailyExpenses.length === 0}
					<div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
						Belum ada pengeluaran kasir yang dicatat hari ini. Uang laci masih utuh.
					</div>
				{:else}
					<div class="max-h-44 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
						{#each dailyExpenses as exp}
							<div class="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
								<div class="min-w-0 flex-1 pr-2">
									<div class="flex items-center gap-2">
										<span class="font-bold text-slate-900 truncate">{exp.category}</span>
										<span class="text-[10px] text-slate-400 font-mono shrink-0">
											{new Date(exp.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
										</span>
									</div>
									<p class="text-[11px] text-slate-500 truncate mt-0.5">{exp.notes || '-'}</p>
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<span class="font-mono font-bold text-red-600">-{formatCurrency(exp.amount)}</span>
									<button
										onclick={() => handleDeleteExpense(exp.id)}
										class="p-1 text-slate-400 hover:text-red-600 transition-colors rounded cursor-pointer"
										title="Hapus pengeluaran ini"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="pt-2 border-t border-slate-200 flex justify-end">
				<button
					onclick={() => (showExpenseModal = false)}
					class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Tutup Kasir / Rekap Harian Shift (Z-Report) -->
{#if showClosingModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
			<!-- Modal Header -->
			<div class="flex justify-between items-center pb-3 border-b border-slate-200">
				<div class="flex items-center gap-2.5">
					<div class="p-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300">
						<FileSpreadsheet class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-slate-900 text-sm sm:text-base">Rekap Harian & Tutup Kasir (Z-Report)</h3>
						<p class="text-[11px] text-slate-500 font-mono">
							{storeName} • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} • Kasir: {cashierName}
						</p>
					</div>
				</div>
				<button onclick={() => (showClosingModal = false)} class="p-1 text-slate-400 hover:text-slate-700 rounded text-base cursor-pointer">✕</button>
			</div>

			<!-- 4 KPI Summary Cards -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
				<div class="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
					<span class="text-[10px] text-blue-700 font-mono uppercase block font-bold">Total Omzet</span>
					<span class="text-sm sm:text-base font-bold text-blue-950 font-mono block mt-0.5">{formatCurrency(totalGrossSales)}</span>
					<span class="text-[10px] text-blue-600 block mt-0.5">{todayTransactions.length} Struk Selesai</span>
				</div>

				<div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
					<span class="text-[10px] text-emerald-700 font-mono uppercase block font-bold">Penjualan Tunai</span>
					<span class="text-sm sm:text-base font-bold text-emerald-950 font-mono block mt-0.5">{formatCurrency(totalCashSales)}</span>
					<span class="text-[10px] text-emerald-600 block mt-0.5">Uang Masuk Laci</span>
				</div>

				<div class="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
					<span class="text-[10px] text-purple-700 font-mono uppercase block font-bold">Non-Tunai (QRIS/Bank)</span>
					<span class="text-sm sm:text-base font-bold text-purple-950 font-mono block mt-0.5">{formatCurrency(totalQrisSales + totalTransferSales)}</span>
					<span class="text-[10px] text-purple-600 block mt-0.5">Masuk Rekening/QRIS</span>
				</div>

				<div class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
					<span class="text-[10px] text-amber-700 font-mono uppercase block font-bold">Pengeluaran Toko</span>
					<span class="text-sm sm:text-base font-bold text-red-600 font-mono block mt-0.5">-{formatCurrency(totalExpenses)}</span>
					<span class="text-[10px] text-amber-700 block mt-0.5">{dailyExpenses.length} Kas Keluar</span>
				</div>
			</div>

			<!-- Drawer Cash Breakdown Calculation Box -->
			<div class="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs">
				<div class="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
					<Coins class="w-4 h-4 text-amber-600" />
					<span>Rekonsiliasi Uang Kas Laci Fisik (Cash Drawer)</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-slate-700 font-mono text-[11px]">
					<!-- Modal Awal -->
					<div class="p-2 bg-white rounded border border-slate-200">
						<span class="text-[10px] text-slate-500 block">MODAL AWAL KASIR</span>
						<div class="flex items-center gap-1 mt-1">
							<span class="font-bold">Rp</span>
							<input
								type="number"
								step="10000"
								bind:value={startingCash}
								oninput={(e) => {
									const val = Number((e.target as HTMLInputElement).value) || 0;
									if (typeof window !== 'undefined') localStorage.setItem('aneka_pos_starting_cash', String(val));
								}}
								class="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-bold text-slate-900 outline-none focus:border-blue-600 text-xs"
							/>
						</div>
					</div>

					<!-- Tambah Kas Masuk Tunai -->
					<div class="p-2 bg-white rounded border border-slate-200">
						<span class="text-[10px] text-emerald-700 block">(+) PENJUALAN TUNAI</span>
						<span class="font-bold text-emerald-700 text-xs block mt-1">+{formatCurrency(totalCashSales)}</span>
					</div>

					<!-- Kurang Kas Keluar -->
					<div class="p-2 bg-white rounded border border-slate-200">
						<span class="text-[10px] text-red-700 block">(-) PENGELUARAN TOKO</span>
						<span class="font-bold text-red-700 text-xs block mt-1">-{formatCurrency(totalExpenses)}</span>
					</div>
				</div>

				<!-- Target Wajib di Laci -->
				<div class="p-3 bg-blue-900 text-white rounded-lg flex justify-between items-center font-mono">
					<div>
						<span class="text-[10px] text-blue-200 block font-sans font-bold">UANG TUNAI WAJIB ADA DI LACI:</span>
						<span class="text-xs text-blue-200/80">Modal Awal + Tunai Masuk - Pengeluaran</span>
					</div>
					<span class="text-base sm:text-lg font-black text-amber-300">{formatCurrency(expectedDrawerCash)}</span>
				</div>
			</div>

			<!-- Input Hitungan Kasir & Realtime Status Selisih -->
			<div class="space-y-2 bg-white p-3.5 border border-slate-200 rounded-xl">
				<div class="flex justify-between items-center">
					<label for="pos-physical-cash" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
						<Calculator class="w-4 h-4 text-blue-600" />
						<span>Hitung & Masukkan Uang Fisik Kasir (Di Laci):</span>
					</label>
					{#if countedPhysicalCash !== null}
						<button
							onclick={() => (countedPhysicalCash = null)}
							class="text-[10px] text-slate-500 hover:text-red-600 underline cursor-pointer"
						>
							Kosongkan
						</button>
					{/if}
				</div>

				<div class="flex gap-2 items-center">
					<div class="relative flex-1">
						<span class="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-sm">Rp</span>
						<input
							id="pos-physical-cash"
							type="number"
							min="0"
							step="1000"
							bind:value={countedPhysicalCash}
							placeholder="Masukkan total uang kertas & koin hasil hitungan kasir..."
							class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 text-slate-900 font-mono font-bold text-base"
						/>
					</div>
					<button
						type="button"
						onclick={() => (countedPhysicalCash = expectedDrawerCash)}
						class="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
						title="Samakan dengan total seharusnya"
					>
						Set Sesuai
					</button>
				</div>

				<!-- Variance Badge -->
				{#if countedPhysicalCash === null}
					<div class="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[11px] flex items-center gap-2">
						<AlertCircle class="w-4 h-4 text-slate-400 shrink-0" />
						<span>Ketikkan total uang tunai yang sudah dihitung dari laci kasir untuk melihat status selisih kas.</span>
					</div>
				{:else if cashDifference === 0}
					<div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
							<div>
								<span class="font-bold block">UANG KAS PAS / SEIMBANG (Rp 0)</span>
								<span class="text-[10px] text-emerald-700 font-mono">Uang fisik laci kasir tepat sesuai dengan rekapitulasi sistem.</span>
							</div>
						</div>
						<span class="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold font-mono text-xs">PAS</span>
					</div>
				{:else if cashDifference && cashDifference > 0}
					<div class="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<AlertTriangle class="w-5 h-5 text-amber-600 shrink-0" />
							<div>
								<span class="font-bold block">KAS LEBIH / SURPLUS (+{formatCurrency(cashDifference)})</span>
								<span class="text-[10px] text-amber-800 font-mono">Uang fisik di laci lebih banyak daripada catatan penjualan.</span>
							</div>
						</div>
						<span class="px-2.5 py-1 bg-amber-600 text-white rounded font-bold font-mono text-xs">LEBIH</span>
					</div>
				{:else if cashDifference && cashDifference < 0}
					<div class="p-3 bg-red-50 border border-red-300 rounded-lg text-red-900 flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<AlertTriangle class="w-5 h-5 text-red-600 shrink-0" />
							<div>
								<span class="font-bold block">KAS TEKOR / SELISIH KURANG (-{formatCurrency(Math.abs(cashDifference))})</span>
								<span class="text-[10px] text-red-800 font-mono">Uang fisik kurang dari yang seharusnya. Harap periksa uang kembalian.</span>
							</div>
						</div>
						<span class="px-2.5 py-1 bg-red-600 text-white rounded font-bold font-mono text-xs">TEKOR</span>
					</div>
				{/if}
			</div>

			<!-- No WA Owner Input (Bisa diatur) -->
			<div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
				<div class="flex items-center gap-1.5">
					<MessageCircle class="w-4 h-4 text-emerald-600 shrink-0" />
					<span class="text-slate-700 font-medium">Nomor WhatsApp Owner (Tujuan Rekap):</span>
				</div>
				<input
					type="text"
					bind:value={ownerWhatsApp}
					oninput={(e) => {
						const val = (e.target as HTMLInputElement).value;
						if (typeof window !== 'undefined') localStorage.setItem('aneka_pos_owner_wa', val);
					}}
					placeholder="081234567890"
					class="w-36 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs text-slate-800 outline-none focus:border-emerald-600 text-right"
				/>
			</div>

			<!-- Action Buttons -->
			<div class="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
				<!-- Cetak Struk Rekap 58mm -->
				<button
					type="button"
					onclick={printShiftReport}
					class="flex-1 min-w-[140px] py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
				>
					<Printer class="w-4 h-4 text-slate-600" /> Cetak Struk Rekap (80mm)
				</button>

				<!-- Kirim WA ke Owner -->
				<button
					type="button"
					onclick={sendWhatsAppReport}
					class="flex-1 min-w-[140px] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
				>
					<MessageCircle class="w-4 h-4" /> Kirim Rekap ke WA Owner
				</button>

				<!-- Selesaikan Shift -->
				<button
					type="button"
					onclick={handleResetShift}
					class="py-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
					title="Selesaikan shift dan bersihkan rekapan untuk shift berikutnya"
				>
					Selesaikan Shift
				</button>

				<button
					type="button"
					onclick={() => (showClosingModal = false)}
					class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Thermal Shift Closing Report 80mm Print Component (Hidden from screen view) -->
<div id="closing-print-area" class="{isPrintingClosing ? 'is-printing' : 'hidden'} text-black font-mono text-xs max-w-[80mm] w-[76mm] mx-auto p-1">
	<div class="text-center mb-2">
		<h2 class="font-bold text-sm uppercase">{storeName}</h2>
		<p class="text-[10px]">{storeAddress}</p>
		<p class="text-[10px]">Telp: {storePhone}</p>
		<div class="border-b border-black border-dashed my-1 pb-1 text-[10px]">
			=== REKAP TUTUP KASIR (Z-REPORT) ===<br />
			Waktu: {new Date().toLocaleString('id-ID')}<br />
			Kasir: {cashierName}
		</div>
	</div>

	<div class="text-[10px] space-y-0.5 border-b border-black border-dashed pb-1">
		<div class="flex justify-between font-bold"><span>RINGKASAN PENJUALAN</span></div>
		<div class="flex justify-between"><span>Jumlah Transaksi:</span><span>{todayTransactions.length} struk</span></div>
		<div class="flex justify-between"><span>Total Omzet Kotor:</span><span>{formatCurrency(totalGrossSales)}</span></div>
		<div class="flex justify-between"><span>• Penjualan Tunai:</span><span>{formatCurrency(totalCashSales)}</span></div>
		<div class="flex justify-between"><span>• Penjualan QRIS:</span><span>{formatCurrency(totalQrisSales)}</span></div>
		<div class="flex justify-between"><span>• Penjualan Transfer:</span><span>{formatCurrency(totalTransferSales)}</span></div>
	</div>

	{#if dailyExpenses.length > 0}
		<div class="text-[10px] space-y-0.5 border-b border-black border-dashed py-1">
			<div class="flex justify-between font-bold"><span>PENGELUARAN TOKO ({dailyExpenses.length})</span></div>
			{#each dailyExpenses as exp}
				<div class="flex justify-between text-[9px]">
					<span class="truncate max-w-[120px]">{exp.category}</span>
					<span>-{formatCurrency(exp.amount)}</span>
				</div>
			{/each}
			<div class="flex justify-between font-bold pt-0.5">
				<span>Total Kas Keluar:</span>
				<span>-{formatCurrency(totalExpenses)}</span>
			</div>
		</div>
	{/if}

	<div class="text-[10px] space-y-0.5 border-b border-black border-dashed py-1">
		<div class="flex justify-between font-bold"><span>REKONSILIASI KAS LACI</span></div>
		<div class="flex justify-between"><span>Modal Awal:</span><span>{formatCurrency(startingCash)}</span></div>
		<div class="flex justify-between"><span>(+) Tunai Masuk:</span><span>+{formatCurrency(totalCashSales)}</span></div>
		<div class="flex justify-between"><span>(-) Pengeluaran:</span><span>-{formatCurrency(totalExpenses)}</span></div>
		<div class="flex justify-between font-bold text-xs pt-0.5 border-t border-black border-dotted">
			<span>WAJIB DI LACI:</span>
			<span>{formatCurrency(expectedDrawerCash)}</span>
		</div>
		<div class="flex justify-between pt-0.5">
			<span>FISIK DIHITUNG:</span>
			<span>{countedPhysicalCash !== null ? formatCurrency(countedPhysicalCash) : '-'}</span>
		</div>
		<div class="flex justify-between font-bold pt-0.5">
			<span>SELISIH KAS:</span>
			<span>
				{#if cashDifference === null}
					Belum dihitung
				{:else if cashDifference === 0}
					PAS (Rp 0)
				{:else if cashDifference > 0}
					LEBIH (+{formatCurrency(cashDifference)})
				{:else}
					TEKOR (-{formatCurrency(Math.abs(cashDifference))})
				{/if}
			</span>
		</div>
	</div>

	<div class="text-center mt-3 text-[9px] space-y-6">
		<div class="flex justify-between text-[9px] pt-2">
			<div>
				<p>Kasir,</p>
				<div class="h-8"></div>
				<p>({cashierName})</p>
			</div>
			<div>
				<p>Owner / Supervisor,</p>
				<div class="h-8"></div>
				<p>(....................)</p>
			</div>
		</div>
		<p class="text-[8px] text-slate-600">Dicetak dari POS Toko Aneka Rasa 99</p>
	</div>
</div>

<!-- Modal Pengaturan Notifikasi & Riwayat (Shopee & POS) -->
{#if showNotificationModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-5 space-y-4 shadow-2xl">
			<!-- Header -->
			<div class="flex justify-between items-center pb-2.5 border-b border-slate-200">
				<div class="flex items-center gap-2">
					<div class="p-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300">
						<BellRing class="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<h3 class="font-bold text-slate-900 text-sm sm:text-base">Pengaturan Notifikasi POS & Shopee</h3>
						<p class="text-[11px] text-slate-500 font-mono">Suara bel & pop-up transaksi serta orderan online masuk</p>
					</div>
				</div>
				<button onclick={() => (showNotificationModal = false)} class="p-1 text-slate-400 hover:text-slate-700 rounded text-base cursor-pointer">✕</button>
			</div>

			<!-- Section 1: Pengaturan Suara Bel Audio -->
			<div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						{#if notificationSettings.soundEnabled}
							<Volume2 class="w-4 h-4 text-emerald-600" />
						{:else}
							<VolumeX class="w-4 h-4 text-slate-400" />
						{/if}
						<div>
							<span class="font-bold text-slate-800 block">Suara Bel Alarm (Audio Chimes)</span>
							<span class="text-[11px] text-slate-500">Bunyikan nada instan saat ada transaksi atau order Shopee</span>
						</div>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							bind:checked={notificationSettings.soundEnabled}
							onchange={saveNotificationSettings}
							class="sr-only peer"
						/>
						<div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
					</label>
				</div>

				{#if notificationSettings.soundEnabled}
					<div class="space-y-1.5 pt-2 border-t border-slate-200">
						<div class="flex justify-between items-center text-[11px]">
							<span class="text-slate-600 font-medium">Volume Suara Bel:</span>
							<span class="font-bold font-mono text-slate-800">{notificationSettings.volume}%</span>
						</div>
						<input
							type="range"
							min="10"
							max="100"
							step="5"
							bind:value={notificationSettings.volume}
							onchange={saveNotificationSettings}
							class="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
						/>
					</div>

					<!-- Tombol Tes Suara -->
					<div class="flex gap-2 pt-1">
						<button
							type="button"
							onclick={playTransactionSuccessSound}
							class="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-slate-700 hover:text-emerald-800 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
						>
							<Bell class="w-3.5 h-3.5 text-emerald-600" /> Tes Bel Kasir
						</button>
						<button
							type="button"
							onclick={playShopeeOrderSound}
							class="flex-1 py-1.5 px-2 bg-white hover:bg-orange-50 border border-slate-300 hover:border-orange-400 text-slate-700 hover:text-orange-800 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
						>
							<ShoppingBag class="w-3.5 h-3.5 text-orange-600" /> Tes Bel Shopee
						</button>
					</div>
				{/if}
			</div>

			<!-- Section 2: Pengaturan Pop-up Layar Kasir -->
			<div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
				<h4 class="font-bold text-slate-800 text-xs">Tampilan Pop-up di Layar Kasir:</h4>

				<!-- Toggle Transaksi Kasir -->
				<div class="flex items-center justify-between pt-1">
					<div>
						<span class="font-bold text-slate-800 block">Pop-up Transaksi Berhasil</span>
						<span class="text-[11px] text-slate-500">Munculkan kartu notifikasi saat pembayaran kasir sukses</span>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							bind:checked={notificationSettings.notifyTransaction}
							onchange={saveNotificationSettings}
							class="sr-only peer"
						/>
						<div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
					</label>
				</div>

				<!-- Toggle Orderan Shopee -->
				<div class="flex items-center justify-between pt-2 border-t border-slate-200">
					<div>
						<span class="font-bold text-slate-800 block">Pop-up Pesanan Shopee Masuk</span>
						<span class="text-[11px] text-slate-500">Munculkan banner oranye Shopee saat ada orderan baru</span>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							bind:checked={notificationSettings.notifyShopee}
							onchange={saveNotificationSettings}
							class="sr-only peer"
						/>
						<div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
					</label>
				</div>

				<!-- Durasi Tampil Pop-up -->
				<div class="pt-2 border-t border-slate-200 space-y-1.5">
					<span class="block text-slate-600 font-medium text-[11px]">Durasi Pop-up Tampil Otomatis:</span>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [
							{ sec: 3, label: '3 Detik' },
							{ sec: 6, label: '6 Detik' },
							{ sec: 10, label: '10 Detik' },
							{ sec: 0, label: 'Manual' }
						] as dur}
							<button
								type="button"
								onclick={() => {
									notificationSettings.autoDismissSeconds = dur.sec;
									saveNotificationSettings();
								}}
								class="py-1 px-2 rounded-lg border text-center font-bold text-[11px] transition-colors cursor-pointer {notificationSettings.autoDismissSeconds === dur.sec
									? 'bg-blue-600 text-white border-blue-700'
									: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}"
							>
								{dur.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Section 3: Uji Coba Simulasi Order Shopee -->
			<div class="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-2">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5 font-bold text-orange-900">
						<Sparkles class="w-4 h-4 text-orange-600" />
						<span>Uji Coba Langsung Notifikasi Shopee</span>
					</div>
					<span class="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded font-mono font-bold">Simulasi Live</span>
				</div>
				<p class="text-[11px] text-orange-800">
					Klik tombol di bawah ini untuk mensimulasikan orderan Shopee masuk secara nyata: nada bel Shopee akan berbunyi dan pop-up banner otomatis tampil di layar kasir.
				</p>
				<button
					type="button"
					onclick={simulateShopeeOrderDirectly}
					disabled={isSimulatingShopee}
					class="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
				>
					<ShoppingBag class="w-3.5 h-3.5" />
					{isSimulatingShopee ? 'Memproses Simulasi...' : '⚡ Kirim Simulasi Pesanan Shopee Masuk Sekarang'}
				</button>
			</div>

			<!-- Section 4: Riwayat Notifikasi Hari Ini -->
			<div class="space-y-2 text-xs pt-1">
				<div class="flex justify-between items-center">
					<span class="font-bold text-slate-800">Riwayat Notifikasi Hari Ini ({notificationHistory.length})</span>
					{#if notificationHistory.length > 0}
						<button
							type="button"
							onclick={clearNotificationHistory}
							class="text-[11px] text-red-600 hover:underline cursor-pointer"
						>
							Hapus Riwayat
						</button>
					{/if}
				</div>

				{#if notificationHistory.length === 0}
					<div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
						Belum ada notifikasi baru hari ini.
					</div>
				{:else}
					<div class="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
						{#each notificationHistory as item}
							<div class="p-2.5 rounded-lg border flex items-center justify-between text-xs {item.type === 'SHOPEE' ? 'bg-orange-50/60 border-orange-200' : 'bg-slate-50 border-slate-200'}">
								<div class="min-w-0 flex-1 pr-2">
									<div class="flex items-center gap-1.5">
										{#if item.type === 'SHOPEE'}
											<span class="px-1.5 py-0.2 bg-orange-500 text-white text-[9px] font-bold rounded">SHOPEE</span>
										{:else}
											<span class="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded">KASIR</span>
										{/if}
										<span class="font-bold text-slate-900 truncate">{item.title}</span>
										<span class="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
									</div>
									<p class="text-[11px] text-slate-600 truncate mt-0.5">{item.message}</p>
								</div>
								{#if item.amount}
									<span class="font-mono font-bold text-slate-800 shrink-0">{formatCurrency(item.amount)}</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="pt-2 border-t border-slate-200 flex justify-end">
				<button
					onclick={() => (showNotificationModal = false)}
					class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
				>
					Selesai
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Floating Real-Time Notifications (Toasts) Pojok Kanan Layar Kasir -->
<aside class="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[92vw] sm:w-[380px] pointer-events-none" aria-live="polite" aria-atomic="true">
	{#each activeToasts as toast (toast.id)}
		<div
			class="pointer-events-auto shadow-2xl rounded-xl border p-3.5 transition-all duration-300 transform animate-in slide-in-from-bottom-5 {toast.type === 'SHOPEE'
				? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-300'
				: 'bg-white border-emerald-500 border-l-4 text-slate-900'}"
		>
			<div class="flex items-start justify-between gap-2">
				<div class="flex items-center gap-2">
					{#if toast.type === 'SHOPEE'}
						<div class="p-1.5 bg-white/20 rounded-lg text-white shrink-0">
							<ShoppingBag class="w-4 h-4 text-white" />
						</div>
					{:else}
						<div class="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
							<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						</div>
					{/if}
					<div>
						<h4 class="font-black text-xs tracking-wide uppercase {toast.type === 'SHOPEE' ? 'text-white' : 'text-slate-900'}">
							{toast.title}
						</h4>
						<span class="text-[10px] font-mono {toast.type === 'SHOPEE' ? 'text-orange-100' : 'text-slate-500'}">
							Waktu: {toast.time} WIB
						</span>
					</div>
				</div>
				<button
					onclick={() => dismissToast(toast.id)}
					class="p-1 rounded hover:bg-black/10 text-xs {toast.type === 'SHOPEE' ? 'text-white' : 'text-slate-400 hover:text-slate-700'} cursor-pointer"
					title="Tutup notifikasi"
				>
					✕
				</button>
			</div>

			<div class="mt-2 text-xs space-y-1">
				{#if toast.type === 'SHOPEE'}
					<div class="p-2 bg-black/15 rounded-lg space-y-0.5 font-mono text-[11px]">
						<div class="flex justify-between">
							<span class="text-orange-100">No. Order:</span>
							<span class="font-bold">#{toast.orderSn}</span>
						</div>
						{#if toast.buyerUsername}
							<div class="flex justify-between">
								<span class="text-orange-100">Pembeli:</span>
								<span class="font-bold">{toast.buyerUsername}</span>
							</div>
						{/if}
						{#if toast.shippingCarrier}
							<div class="flex justify-between">
								<span class="text-orange-100">Kurir:</span>
								<span>{toast.shippingCarrier}</span>
							</div>
						{/if}
						{#if toast.amount}
							<div class="flex justify-between pt-1 border-t border-white/20 font-bold text-xs text-amber-200">
								<span>Total Pesanan:</span>
								<span>{formatCurrency(toast.amount)}</span>
							</div>
						{/if}
					</div>
					<div class="flex gap-2 pt-1">
						<a
							href="/admin/shopee"
							class="flex-1 py-1.5 bg-white text-orange-600 hover:bg-orange-50 rounded font-bold text-center text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
						>
							<ExternalLink class="w-3 h-3" /> Buka Tab Shopee
						</a>
						<button
							onclick={() => dismissToast(toast.id)}
							class="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded font-bold text-xs transition-colors cursor-pointer"
						>
							Tutup
						</button>
					</div>
				{:else}
					<p class="text-slate-600 text-xs">{toast.message}</p>
					{#if toast.amount}
						<div class="flex justify-between items-center pt-1 font-mono font-bold text-slate-800 text-xs">
							<span class="text-slate-500 font-sans text-[11px]">Total Transaksi:</span>
							<span class="text-emerald-700">{formatCurrency(toast.amount)}</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/each}
</aside>

<!-- Thermal Receipt Print Component 80mm (Standar POS Kasir Toko & Minimarket) -->
<div id="receipt-print-area" class="hidden text-black font-mono text-xs max-w-[80mm] w-[76mm] mx-auto p-1">
	<div class="text-center mb-2">
		<h2 class="font-black text-base uppercase tracking-tight">{storeName}</h2>
		<p class="text-[11px] leading-tight mt-0.5">{storeAddress}</p>
		<p class="text-[11px] leading-tight">Telp / WA: {storePhone}</p>
		<div class="border-b-2 border-black border-dashed my-2 pb-1.5 text-[11px] text-left">
			<div class="flex justify-between"><span>No: {completedTxData?.receiptNumber || $lastReceiptNumber}</span><span>{new Date().toLocaleDateString('id-ID')}</span></div>
			<div class="flex justify-between"><span>Kasir: {cashierName}</span><span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span></div>
		</div>
	</div>

	<table class="w-full text-[11px] mb-2 border-collapse">
		<tbody>
			{#each (completedTxData?.items || receiptItems) as item}
				<tr>
					<td colspan="2" class="font-bold pt-1">{item.name}</td>
				</tr>
				<tr class="border-b border-black/20 border-dotted">
					<td class="pb-1 text-slate-700">{item.qty} x {formatCurrency(item.price)}</td>
					<td class="pb-1 text-right font-semibold">{formatCurrency(item.qty * item.price)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="border-t-2 border-black border-dashed pt-2 text-[11px] space-y-1">
		<div class="flex justify-between"><span>Subtotal Belanja:</span><span>{formatCurrency(completedTxData?.subtotal ?? $subtotal)}</span></div>
		{#if (completedTxData?.discount ?? (pointDiscountAmount + $discount)) > 0}
			<div class="flex justify-between"><span>Diskon:</span><span>- {formatCurrency(completedTxData?.discount ?? (pointDiscountAmount + $discount))}</span></div>
		{/if}
		<div class="flex justify-between font-black text-sm pt-1.5 border-t border-black border-dotted">
			<span>TOTAL TRANSAKSI:</span><span>{formatCurrency(completedTxData?.total ?? finalPayTotal)}</span>
		</div>
		<div class="flex justify-between pt-1">
			<span>BAYAR ({$paymentMethod}):</span><span class="font-bold">{formatCurrency(completedTxData?.paidAmount ?? ($paymentMethod === 'CASH' ? $amountPaid || finalPayTotal : finalPayTotal))}</span>
		</div>
		{#if $paymentMethod === 'CASH'}
			<div class="flex justify-between font-bold text-xs pt-0.5">
				<span>KEMBALI:</span><span>{formatCurrency(completedTxData?.changeAmount ?? Math.max(0, ($amountPaid || 0) - finalPayTotal))}</span>
			</div>
		{/if}
	</div>

	<div class="text-center mt-4 text-[10px] space-y-0.5 border-t-2 border-black border-dashed pt-2">
		<p class="font-bold">*** TERIMA KASIH ATAS KUNJUNGAN ANDA ***</p>
		<p>Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka</p>
		<p class="text-[9px] text-slate-600">Barang yang dibeli tidak dapat ditukar/dikembalikan.</p>
	</div>
</div>
