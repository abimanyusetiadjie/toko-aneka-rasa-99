export interface RealtimeEvent {
	type: 'TRANSACTION_COMPLETED' | 'STOCK_CHANGED' | 'SYNC_PULSE' | 'SHOPEE_ORDER_RECEIVED';
	data: {
		receiptNumber?: string;
		orderSn?: string;
		buyerUsername?: string;
		newStatus?: string;
		totalAmount?: number;
		items?: Array<{
			productId: string;
			productName?: string;
			qty: number;
			baseQty: number;
			newBalance?: number;
		}>;
		timestamp: string;
		message?: string;
		[key: string]: any;
	};
}

type ClientController = ReadableStreamDefaultController<string>;

// Set of active SSE client stream controllers
const clients = new Set<ClientController>();

/**
 * Register a new SSE client
 */
export function addRealtimeClient(controller: ClientController) {
	clients.add(controller);
}

/**
 * Unregister an SSE client when connection closes
 */
export function removeRealtimeClient(controller: ClientController) {
	clients.delete(controller);
}

/**
 * Get count of active real-time subscribers
 */
export function getActiveClientCount(): number {
	return clients.size;
}

/**
 * Broadcast an event to all connected clients (PC, HP, tablets)
 */
export function broadcastRealtimeEvent(event: RealtimeEvent) {
	const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;

	for (const controller of clients) {
		try {
			controller.enqueue(message);
		} catch {
			// Remove stale/disconnected client
			clients.delete(controller);
		}
	}
}
