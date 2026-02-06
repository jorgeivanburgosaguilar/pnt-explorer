<script>
	let token = $state('');
	let idSolicitudDependencia = $state('');
	let resultadoDetalle = $state(null);
	let resultadoSolicitante = $state(null);
	let errorDetalle = $state('');
	let errorSolicitante = $state('');
	let cargando = $state(false);

	async function consultar() {
		errorDetalle = '';
		errorSolicitante = '';
		resultadoDetalle = null;
		resultadoSolicitante = null;

		const id = parseInt(idSolicitudDependencia, 10);
		if (isNaN(id)) {
			errorDetalle = 'Ingresa un número entero válido.';
			errorSolicitante = 'Ingresa un número entero válido.';
			return;
		}

		if (!token.trim()) {
			errorDetalle = 'El token es requerido.';
			errorSolicitante = 'El token es requerido.';
			return;
		}

		cargando = true;
		const body = JSON.stringify({ idSolicitudDependencia: id, token: token.trim() });
		const headers = { 'Content-Type': 'application/json' };

		const [resDetalle, resSolicitante] = await Promise.allSettled([
			fetch('/api/obtener-detalle', { method: 'POST', headers, body }),
			fetch('/api/obtener-detalle-solicitante', { method: 'POST', headers, body })
		]);

		// Procesar respuesta de detalle SICOM
		if (resDetalle.status === 'fulfilled') {
			const res = resDetalle.value;
			const data = await res.json();
			if (res.ok) {
				resultadoDetalle = data;
			} else {
				errorDetalle = data.error || `Error ${res.status}`;
			}
		} else {
			errorDetalle = resDetalle.reason?.message || 'Error de conexión';
		}

		// Procesar respuesta de detalle solicitante
		if (resSolicitante.status === 'fulfilled') {
			const res = resSolicitante.value;
			const data = await res.json();
			if (res.ok) {
				resultadoSolicitante = data;
			} else {
				errorSolicitante = data.error || `Error ${res.status}`;
			}
		} else {
			errorSolicitante = resSolicitante.reason?.message || 'Error de conexión';
		}

		cargando = false;
	}
</script>

<main class="mx-auto max-w-5xl px-4 py-12">
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">PNT Explorer</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			consultar();
		}}
		class="space-y-4"
	>
		<div>
			<label for="token" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Bearer Token
			</label>
			<textarea
				id="token"
				bind:value={token}
				placeholder="Pega aquí el token JWT (sin el prefijo 'Bearer')"
				required
				rows="3"
				class="mt-1 block w-full rounded-md border-gray-300 font-mono text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
			></textarea>
		</div>

		<div>
			<label for="idSolicitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				ID Solicitud Dependencia
			</label>
			<input
				id="idSolicitud"
				type="number"
				bind:value={idSolicitudDependencia}
				placeholder="Ej: 123456"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
			/>
		</div>

		<button
			type="submit"
			disabled={cargando}
			class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
		>
			{#if cargando}
				Consultando...
			{:else}
				Consultar
			{/if}
		</button>
	</form>

	{#if resultadoDetalle || resultadoSolicitante || errorDetalle || errorSolicitante}
		<div class="mt-8 grid gap-6 lg:grid-cols-2">
			<!-- Detalle SICOM -->
			<div>
				<h2 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Detalle SICOM</h2>
				{#if errorDetalle}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorDetalle}</div>
				{:else if resultadoDetalle}
					<pre
						class="overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
							resultadoDetalle,
							null,
							2
						)}</pre>
				{/if}
			</div>

			<!-- Detalle Solicitante -->
			<div>
				<h2 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Detalle Solicitante</h2>
				{#if errorSolicitante}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorSolicitante}</div>
				{:else if resultadoSolicitante}
					<pre
						class="overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
							resultadoSolicitante,
							null,
							2
						)}</pre>
				{/if}
			</div>
		</div>
	{/if}
</main>
