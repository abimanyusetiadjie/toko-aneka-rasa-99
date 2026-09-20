<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { User, Lock, AlertCircle, ShoppingCart, ArrowLeft } from 'lucide-svelte';

	let { form } = $props<{ form: ActionData }>();
	
	let isLoading = $state(false);
</script>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
		<div class="mb-4">
			<a href="/" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Kembali ke Halaman Toko</span>
			</a>
		</div>
		<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-20 h-20 mx-auto rounded-full object-cover border-2 border-slate-300 shadow-md mb-3" />
		<h2 class="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
			Toko Aneka Rasa 99
		</h2>
		<p class="mt-1 text-center text-xs text-slate-500 font-medium">
			Sistem Manajemen & Kasir POS · Poris Indah
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
			{#if form?.error}
				<div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3 text-sm">
					<AlertCircle class="w-5 h-5 shrink-0 text-red-500" />
					<span>{form.error}</span>
				</div>
			{/if}

			<form 
				method="POST" 
				class="space-y-6"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
			>
				<div>
					<label for="username" class="block text-sm font-medium text-slate-700">Username</label>
					<div class="mt-1 relative rounded-md shadow-sm">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-slate-400" />
						</div>
						<input
							id="username"
							name="username"
							type="text"
							required
							value={form?.username ?? ''}
							class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
							placeholder="kasir_siti"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-slate-700">Password / PIN</label>
					<div class="mt-1 relative rounded-md shadow-sm">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-slate-400" />
						</div>
						<input
							id="password"
							name="password"
							type="password"
							required
							class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<div>
					<button
						type="submit"
						disabled={isLoading}
						class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
					>
						{isLoading ? 'Memproses...' : 'Masuk ke Sistem'}
					</button>
				</div>
			</form>
			
			<div class="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600 space-y-2">
				<p class="font-bold text-slate-800">Akses Otomatis Sesuai Role (RBAC):</p>
				<div class="grid grid-cols-2 gap-2 text-left text-[11px] pt-1">
					<div class="p-2 bg-white rounded-lg border border-slate-100">
						<span class="font-bold text-purple-700 block">👑 Akun Owner</span>
						<span class="text-slate-500">Otomatis ke Dashboard & Manajemen</span>
					</div>
					<div class="p-2 bg-white rounded-lg border border-slate-100">
						<span class="font-bold text-blue-700 block">🛒 Akun Kasir</span>
						<span class="text-slate-500">Otomatis ke Layar Kasir POS</span>
					</div>
				</div>
				<p class="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
					Demo: <b>owner_revaldo</b> / 12345678 · <b>kasir_siti</b> / minimarket123*
				</p>
			</div>
		</div>
	</div>
</div>
