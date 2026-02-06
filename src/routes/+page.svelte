<script>
	let idSolicitudDependencia = $state('');
	let resultado = $state(null);
	let error = $state('');
	let cargando = $state(false);

	async function consultar() {
		error = '';
		resultado = null;

		const id = parseInt(idSolicitudDependencia, 10);
		if (isNaN(id)) {
			error = 'Ingresa un número entero válido.';
			return;
		}

		cargando = true;
		try {
			const res = await fetch('/api/obtener-detalle', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idSolicitudDependencia: id })
			});
			const data = await res.json();

			if (!res.ok) {
				error = data.error || `Error ${res.status}`;
				return;
			}

			resultado = data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error de conexión';
		} finally {
			cargando = false;
		}
	}
</script>

<main class="mx-auto max-w-2xl px-4 py-12">
	<h1 class="mb-6 text-2xl font-bold text-gray-900">PNT Explorer</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			consultar();
		}}
		class="space-y-4"
	>
		<div>
			<label for="idSolicitud" class="block text-sm font-medium text-gray-700">
				ID Solicitud Dependencia
			</label>
			<input
				id="idSolicitud"
				type="number"
				bind:value={idSolicitudDependencia}
				placeholder="Ej: 123456"
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			/>
		</div>

		<button
			type="submit"
			disabled={cargando}
			class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
		>
			{#if cargando}
				Consultando...
			{:else}
				Consultar
			{/if}
		</button>
	</form>

	{#if error}
		<div class="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
	{/if}

	{#if resultado}
		<div class="mt-6">
			<h2 class="mb-2 text-lg font-semibold text-gray-800">Resultado</h2>
			<pre class="overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-gray-800">{JSON.stringify(
					resultado,
					null,
					2
				)}</pre>
		</div>
	{/if}
</main>
