<script>
	let token = $state('');
	let idSolicitudDependencia = $state('');
	let resultadoOgDetalle = $state(null);
	let resultadoOgSeguimiento = $state(null);
	let errorOgDetalle = $state('');
	let errorOgSeguimiento = $state('');
	let cargando = $state(false);

	async function consultar() {
		errorOgDetalle = '';
		errorOgSeguimiento = '';
		resultadoOgDetalle = null;
		resultadoOgSeguimiento = null;

		const id = parseInt(idSolicitudDependencia, 10);
		if (isNaN(id)) {
			errorOgDetalle = errorOgSeguimiento = 'Ingresa un número entero válido.';
			return;
		}

		if (!token.trim()) {
			errorOgDetalle = errorOgSeguimiento = 'El token es requerido.';
			return;
		}

		cargando = true;
		const body = JSON.stringify({ idSolicitudDependencia: id, token: token.trim() });
		const headers = { 'Content-Type': 'application/json' };

		const [resOgDetalle, resOgSeguimiento] = await Promise.allSettled([
			fetch('/api/og-obtener-detalle', { method: 'POST', headers, body }),
			fetch('/api/og-seguimiento-solicitud', { method: 'POST', headers, body })
		]);

		// Procesar respuesta de detalle OG
		if (resOgDetalle.status === 'fulfilled') {
			const res = resOgDetalle.value;
			const data = await res.json();
			if (res.ok) {
				resultadoOgDetalle = data;
			} else {
				errorOgDetalle = data.error || `Error ${res.status}`;
			}
		} else {
			errorOgDetalle = resOgDetalle.reason?.message || 'Error de conexión';
		}

		// Procesar respuesta de seguimiento OG
		if (resOgSeguimiento.status === 'fulfilled') {
			const res = resOgSeguimiento.value;
			const data = await res.json();
			if (res.ok) {
				resultadoOgSeguimiento = data;
			} else {
				errorOgSeguimiento = data.error || `Error ${res.status}`;
			}
		} else {
			errorOgSeguimiento = resOgSeguimiento.reason?.message || 'Error de conexión';
		}

		cargando = false;
	}
</script>

<main class="mx-auto max-w-5xl px-4 py-12">
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Inicio</a>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Explorador Organo Garante</h1>
	</div>

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

	{#if resultadoOgDetalle || resultadoOgSeguimiento || errorOgDetalle || errorOgSeguimiento}
		<div class="mt-8 grid gap-6 lg:grid-cols-2">
			<!-- Detalle OG -->
			<div>
				<h2 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Detalle OG</h2>
				{#if errorOgDetalle}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorOgDetalle}</div>
				{:else if resultadoOgDetalle}
					<pre
						class="overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
							resultadoOgDetalle,
							null,
							2
						)}</pre>
				{/if}
			</div>

			<!-- Seguimiento OG -->
			<div>
				<h2 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Seguimiento OG</h2>
				{#if errorOgSeguimiento}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorOgSeguimiento}</div>
				{:else if resultadoOgSeguimiento}
					<pre
						class="overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
							resultadoOgSeguimiento,
							null,
							2
						)}</pre>
				{/if}
			</div>
		</div>
	{/if}
</main>
