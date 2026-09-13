import type { RequestHandler } from './$types';
import { addRealtimeClient, removeRealtimeClient } from '$lib/server/realtime-hub';

export const GET: RequestHandler = ({ request }) => {
	let clientController: ReadableStreamDefaultController<string>;
	let heartbeatInterval: NodeJS.Timeout;

	const stream = new ReadableStream<string>({
		start(controller) {
			clientController = controller;
			addRealtimeClient(controller);

			// Send initial connected handshake event
			controller.enqueue(
				`event: SYNC_PULSE\ndata: ${JSON.stringify({
					message: 'Connected to SmartPOS Real-Time Event Hub',
					timestamp: new Date().toISOString()
				})}\n\n`
			);

			// Heartbeat every 15 seconds to keep mobile socket connections alive
			heartbeatInterval = setInterval(() => {
				try {
					controller.enqueue(`: ping ${Date.now()}\n\n`);
				} catch {
					clearInterval(heartbeatInterval);
					removeRealtimeClient(controller);
				}
			}, 15000);
		},
		cancel() {
			if (heartbeatInterval) clearInterval(heartbeatInterval);
			if (clientController) removeRealtimeClient(clientController);
		}
	});

	// Cleanup on client disconnect / tab close
	request.signal.addEventListener('abort', () => {
		if (heartbeatInterval) clearInterval(heartbeatInterval);
		if (clientController) removeRealtimeClient(clientController);
	});

	return new Response(stream.pipeThrough(new TextEncoderStream()), {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
