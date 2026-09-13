<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { User, Lock, AlertCircle, ShoppingCart } from 'lucide-svelte';

	let { form } = $props<{ form: ActionData }>();
	
	let isLoading = $state(false);
</script>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
		<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-20 h-20 mx-auto rounded-full object-cover border-2 border-slate-300 shadow-md mb-3" />
		<h2 class="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
			Toko Aneka Rasa 99
		</h2>
		<p class="mt-1 text-center text-xs text-slate-500 font-mono">
			Poris Indah Blok B 11 No.1
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
			
			<div class="mt-6 text-center text-xs text-slate-500">
				Hint (In-Memory Data):<br/>
				- kasir_siti / minimarket123*<br/>
				- manager_budi / minimarket123*
			</div>
		</div>
	</div>
</div>
