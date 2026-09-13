import './style.css'
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'

Alpine.plugin(collapse)

window.posApp = () => {
  return {
    barcode: '',
    cart: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'CASH', 
    amountPaid: null,
    paymentRef: '',
    memberId: '',
    notification: '',
    isProcessing: false,
    lastReceiptNumber: '',
    printCartHtml: '',
    cashierName: 'Siti Aminah',
    storeName: 'SmartPOS Minimarket',
    storeAddress: 'Jl. Pemuda No. 45, Jakarta',
    storePhone: '0812-3456-7890',
    
    // Real Backend API endpoint
    apiBase: 'http://localhost:8080/api/pos',
    
    init() {
      // Focus barcode field saat aplikasi pertama kali dimuat
      setTimeout(() => this.$refs.barcodeInput?.focus(), 100);
    },

    handleGlobalKeys(e) {
      if (e.key === 'F2') {
        e.preventDefault();
        this.$refs.barcodeInput?.focus();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        this.setPayment('CASH');
      }
      if (e.key === 'F9') {
        e.preventDefault();
        this.setPayment('DEBIT');
      }
      if (e.key === 'F10') {
        e.preventDefault();
        this.setPayment('QRIS');
      }
      if (e.key === 'F12') {
        e.preventDefault();
        if (this.cart.length > 0) this.processTransaction();
      }
    },

    setPayment(method) {
      this.paymentMethod = method;
      if (method !== 'CASH') {
        this.amountPaid = null;
      }
    },

    async scanBarcode() {
      if (!this.barcode.trim()) return;
      
      const code = this.barcode.trim();
      this.barcode = ''; // Bersihkan field
      this.notification = '';
      
      try {
        const res = await fetch(`${this.apiBase}/products/scan?barcode=${encodeURIComponent(code)}`, {
          headers: { 
            'Accept': 'application/json',
            'Authorization': 'Bearer DEV_KASIR_TOKEN' 
          }
        });
        
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.messages?.error || errData.error || `Barcode "${code}" tidak ditemukan dalam database.`);
        }
        
        const data = await res.json();
        
        // Cek apakah item sudah ada di cart dengan unit yang sama
        const existingItemIndex = this.cart.findIndex(i => i.product_id === data.product.id && i.unit_id === data.scanned_unit.id);
        
        if (existingItemIndex > -1) {
          this.cart[existingItemIndex].qty++;
        } else {
          // Masukkan item ke daftar belanja
          this.cart.unshift({
            id: code + '-' + Date.now(), 
            product_id: data.product.id,
            unit_id: data.scanned_unit.id,
            name: data.product.name,
            qty: 1,
            price: parseFloat(data.scanned_unit.price),
            available_units: data.all_units || [data.scanned_unit]
          });
        }

        this.recalculate();
        
        // Fetch Real Machine Learning Recommendations
        this.fetchMlRecommendations(data.product.id);

      } catch (err) {
        this.notification = '⚠️ ' + err.message;
      }
    },

    async fetchMlRecommendations(productId) {
      try {
        const recRes = await fetch(`${this.apiBase}/recommendations?product_id=${encodeURIComponent(productId)}`, {
          headers: { 'Authorization': 'Bearer DEV_KASIR_TOKEN' }
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.recommendations && recData.recommendations.length > 0) {
            const topRec = recData.recommendations[0];
            this.notification = `💡 Rekomendasi ML: ${topRec.message}`;
          }
        }
      } catch (e) {
        // Silent fail for optional ML recommendation fetch
      }
    },

    updateItemUnit(index) {
        const item = this.cart[index];
        const selectedUnit = item.available_units.find(u => u.id === item.unit_id);
        if (selectedUnit) {
            item.price = parseFloat(selectedUnit.price);
        }
    },

    removeItem(index) {
      this.cart.splice(index, 1);
      this.recalculate();
    },

    recalculate() {
      this.subtotal = this.cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
      // Member discount calculation (5%)
      this.discount = this.memberId ? Math.round(this.subtotal * 0.05) : 0; 
      this.total = this.subtotal - this.discount;
    },

    formatCurrency(val) {
      if (!val && val !== 0) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    },

    async processTransaction() {
      if (this.cart.length === 0) return;
      if (this.paymentMethod === 'CASH' && (this.amountPaid || 0) < this.total) {
        alert("Uang tunai kurang dari total belanja!");
        return;
      }
      if (this.paymentMethod !== 'CASH' && !this.paymentRef) {
        alert("Nomor Referensi (EDC/QRIS) wajib diisi!");
        return;
      }

      this.isProcessing = true;
      
      const payload = {
        member_id: this.memberId || null,
        total_amount: this.total,
        payment_method: this.paymentMethod,
        payment_reference: this.paymentRef || null,
        amount_paid: this.paymentMethod === 'CASH' ? this.amountPaid : this.total,
        items: this.cart.map(i => ({
            unit_id: i.unit_id,
            qty: i.qty
        }))
      };

      try {
        const res = await fetch(`${this.apiBase}/transactions`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer DEV_KASIR_TOKEN' 
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.messages?.error || errData.error || 'Transaksi gagal diproses oleh server.');
        }

        const data = await res.json();
        
        // Prepare genuine receipt data
        this.lastReceiptNumber = data.receipt_number || ('RCPT-' + Date.now());
        this.printCartHtml = this.cart.map(item => `
            <tr>
                <td colspan="2" class="pb-1 font-semibold">${item.name}</td>
            </tr>
            <tr>
                <td class="pb-2 text-slate-600">${item.qty} x ${this.formatCurrency(item.price)}</td>
                <td class="pb-2 text-right">${this.formatCurrency(item.qty * item.price)}</td>
            </tr>
        `).join('');

        // Trigger thermal print dialog
        setTimeout(() => {
            window.print();
            this.resetCart();
        }, 100);
        
      } catch (err) {
        alert(`❌ Transaksi Gagal: ${err.message}`);
      } finally {
        this.isProcessing = false;
      }
    },
    
    resetCart() {
        this.cart = [];
        this.recalculate();
        this.amountPaid = null;
        this.paymentRef = '';
        this.notification = '';
        this.memberId = '';
        this.$refs.barcodeInput?.focus();
    }
  }
}

window.Alpine = Alpine
Alpine.start()
