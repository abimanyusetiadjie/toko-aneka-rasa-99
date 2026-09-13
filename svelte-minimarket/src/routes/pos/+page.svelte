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
		deductLocalStock
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
		RefreshCw
	} from 'lucide-svelte';

	let barcodeInput: HTMLInputElement;
	let barcode = $state('');
	let cashierName = $state('Siti Aminah');
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

	let scannerDriver: BarcodeScannerListener | null = null;

	// Quick Pick Catalog State (Simulasi Tanpa Scanner Fisik / Demo)
	let showCatalogModal = $state(false);
	let catalogSearch = $state('');
	let catalogProducts = $state<any[]>([]);
	let isLoadingCatalog = $state(false);
	let posSseSource: EventSource | null = null;

	async function fetchCatalog() {
		isLoadingCatalog = true;
		try {
			const res = await fetch('/api/pos/products');
			const data = await res.json();
			catalogProducts = data.products || [];
		} catch (e) {
			console.error(e);
		} finally {
			isLoadingCatalog = false;
		}
	}

	async function openCatalog() {
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

	// Preset Uang Tunai Cepat
	function setCashAmount(val: number) {
		$paymentMethod = 'CASH';
		$amountPaid = val;
	}

	function setExactCash() {
		$paymentMethod = 'CASH';
		$amountPaid = finalPayTotal;
	}

	// 1. Pindai Barcode (Local-First Cache Strategy)
	async function handleScan(codeToScan?: string) {
		const code = (codeToScan || barcode).trim();
		if (!code) return;
		barcode = '';

		const cached = findLocalProduct(code);
		if (cached) {
			addItem(cached.product, cached.scanned_unit, cached.all_units);
			return;
		}

		try {
			const res = await fetch(`/api/pos/scan?barcode=${encodeURIComponent(code)}`);
			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.message || `Barcode "${code}" tidak terdaftar di sistem`);
			}

			const data = await res.json();
			addItem(data.product, data.scanned_unit, data.all_units);
			cacheProductItem(code, data);
		} catch (err: any) {
			displayActionableError(`Barcode Tidak Terdaftar: "${code}"`, 'Pastikan barcode sudah didaftarkan di Master Inventory gudang.');
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
			
			showSuccessModal = true;
			setTimeout(() => {
				window.print();
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
		} else if (e.key === 'F3') {
			e.preventDefault();
			showMemberModal = true;
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
		} else if (e.key === 'F10') {
			e.preventDefault();
			openQRIS();
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

		// Sinkronisasi Real-Time SSE: Segarkan katalog ketika ada produk/stok baru
		if (typeof window !== 'undefined' && 'EventSource' in window) {
			try {
				posSseSource = new EventSource('/api/realtime/events');
				posSseSource.addEventListener('STOCK_CHANGED', () => {
					fetchCatalog();
				});
			} catch {}
		}
	});

	onDestroy(() => {
		scannerDriver?.detach();
		stopCameraScan();
		if (idleTimeout) clearTimeout(idleTimeout);
		if (posSseSource) posSseSource.close();
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
			<a href="/" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shrink-0" title="Kembali ke Portal">
				<ArrowLeft class="w-4 h-4" />
			</a>
			<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300 shadow-xs shrink-0" />
			<div class="min-w-0">
				<h1 class="text-xs sm:text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
					<span class="truncate">{storeName}</span>
					{#if $isOnline}
						<span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-bold shrink-0">
							<Wifi class="w-2.5 h-2.5 text-emerald-600" /> <span class="hidden sm:inline">Online (Supabase)</span>
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
		<div class="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
			<button
				onclick={() => (showHelpModal = true)}
				class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded text-slate-700 transition-colors font-medium"
			>
				<HelpCircle class="w-3.5 h-3.5 text-blue-600" />
				<span class="kbd-badge">F1</span>
				<span class="text-[11px]">Bantuan</span>
			</button>

			<button
				onclick={() => (showMemberModal = true)}
				class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded border transition-all {currentMember
					? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
					: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'}"
			>
				<Award class="w-4 h-4 text-purple-600 shrink-0" />
				<div class="text-left">
					<span class="text-[8px] sm:text-[9px] text-slate-500 block font-mono">MEMBER</span>
					<span class="font-bold text-[11px] sm:text-xs max-w-[70px] sm:max-w-none truncate block">{currentMember ? currentMember.name : 'Pilih'}</span>
				</div>
			</button>

			<div class="flex items-center gap-1.5 sm:gap-2 border-l border-slate-300 pl-2 sm:pl-3">
				<User class="w-4 h-4 text-slate-400 shrink-0" />
				<div class="text-left">
					<span class="text-[8px] sm:text-[9px] text-slate-500 block font-mono">KASIR</span>
					<span class="font-bold text-[11px] sm:text-xs text-slate-800 max-w-[65px] sm:max-w-none truncate block">{cashierName}</span>
				</div>
			</div>
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
							onclick={() => ($paymentMethod = 'CASH')}
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

							<input
								type="number"
								bind:value={$amountPaid}
								placeholder="Ketik nominal uang..."
								class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-lg font-mono font-bold outline-none focus:border-emerald-600 text-slate-900"
							/>

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
					<input id="split-modal-cash" type="number" bind:value={splitCashAmount} class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold" />
				</div>

				<div class="space-y-1">
					<label for="split-modal-noncash" class="block text-slate-600 text-[11px] font-mono">NOMINAL NON-TUNAI:</label>
					<div class="flex gap-2">
						<select bind:value={splitNonCashMethod} class="bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs">
							<option value="QRIS">QRIS</option>
							<option value="DEBIT">Debit EDC</option>
						</select>
						<input id="split-modal-noncash" type="number" bind:value={splitNonCashAmount} class="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold" />
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
				<button onclick={() => (showQRISModal = false)} class="text-slate-400 hover:text-slate-700 text-base cursor-pointer">✕</button>
			</div>

			<!-- Kartu Standar QRIS Indonesia (Cocok untuk QRIS BCA / Merchant Bank / Xendit) -->
			<div class="p-3.5 bg-slate-50 border-2 border-dashed border-purple-200 rounded-xl inline-block shadow-xs mx-auto w-full max-w-[260px]">
				<div class="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
					<span class="text-[10px] font-black tracking-wider text-rose-600 font-mono">QRIS</span>
					<span class="text-[9px] font-bold text-slate-700 truncate max-w-[150px]">{storeName}</span>
				</div>
				<div class="w-40 h-40 bg-white border border-slate-300 rounded-lg flex flex-col items-center justify-center mx-auto p-2 shadow-inner relative">
					<QrCode class="w-24 h-24 text-slate-900" />
					<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div class="w-7 h-7 bg-white rounded shadow-xs border border-purple-300 flex items-center justify-center">
							<span class="text-[9px] font-black text-purple-700">99</span>
						</div>
					</div>
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
				<div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-600">Member & Tukar Poin:</span><span class="kbd-badge">F3</span></div>
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

<!-- Thermal Receipt Print Component 58mm (Hidden from screen view) -->
<div id="receipt-print-area" class="hidden text-black font-mono text-xs max-w-[58mm] mx-auto p-1">
	<div class="text-center mb-2">
		<h2 class="font-bold text-sm uppercase">{storeName}</h2>
		<p class="text-[10px]">{storeAddress}</p>
		<p class="text-[10px]">Telp: {storePhone}</p>
		<div class="border-b border-black border-dashed my-1 pb-1 text-[10px]">
			No: {completedTxData?.receiptNumber || $lastReceiptNumber}<br />
			Kasir: {cashierName}<br />
			Waktu: {new Date().toLocaleString('id-ID')}
		</div>
	</div>

	<table class="w-full text-[10px] mb-2">
		<tbody>
			{#each (completedTxData?.items || receiptItems) as item}
				<tr>
					<td colspan="2" class="font-semibold">{item.name}</td>
				</tr>
				<tr>
					<td class="pb-0.5 text-slate-600">{item.qty} x {formatCurrency(item.price)}</td>
					<td class="pb-0.5 text-right">{formatCurrency(item.qty * item.price)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="border-t border-black border-dashed pt-1 text-[10px] space-y-0.5">
		<div class="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(completedTxData?.subtotal ?? $subtotal)}</span></div>
		{#if (completedTxData?.discount ?? (pointDiscountAmount + $discount)) > 0}
			<div class="flex justify-between"><span>Diskon:</span><span>- {formatCurrency(completedTxData?.discount ?? (pointDiscountAmount + $discount))}</span></div>
		{/if}
		<div class="flex justify-between font-bold text-xs pt-1 border-t border-black border-dotted">
			<span>TOTAL:</span><span>{formatCurrency(completedTxData?.total ?? finalPayTotal)}</span>
		</div>
		<div class="flex justify-between pt-0.5">
			<span>BAYAR ({$paymentMethod}):</span><span>{formatCurrency(completedTxData?.paidAmount ?? ($paymentMethod === 'CASH' ? $amountPaid || finalPayTotal : finalPayTotal))}</span>
		</div>
		{#if $paymentMethod === 'CASH'}
			<div class="flex justify-between font-semibold">
				<span>KEMBALI:</span><span>{formatCurrency(completedTxData?.changeAmount ?? Math.max(0, ($amountPaid || 0) - finalPayTotal))}</span>
			</div>
		{/if}
	</div>

	<div class="text-center mt-3 text-[9px]">
		<p>Terima kasih atas kunjungan Anda!</p>
		<p>Barang yang dibeli tidak dapat ditukar/dikembalikan.</p>
	</div>
</div>
