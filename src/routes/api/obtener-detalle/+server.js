import { json } from '@sveltejs/kit';

/**
 * @param {{ request: Request }} event
 */
export async function POST({ request }) {
	try {
		// Parse the incoming request body
		const body = await request.json();
		const { idSolicitudDependencia } = body;

		// Validate required parameter
		if (!idSolicitudDependencia) {
			return json(
				{ error: 'idSolicitudDependencia is required' },
				{ status: 400 }
			);
		}

		// Prepare the payload for the external API
		const payload = {
			idSolicitudDependencia: idSolicitudDependencia,
			idOrganoGarante: 31
		};

		// Headers matching the Python script
		const headers = {
			'Host': 'www.plataformadetransparencia.org.mx',
			'Sec-Ch-Ua-Platform': '"Windows"',
			'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144"',
			'Sec-Ch-Ua-Mobile': '?0',
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json',
			'Accept-Language': 'es-419,es;q=0.9',
			'Accept-Encoding': 'gzip, deflate, br',
			'Priority': 'u=1, i',
			'Referer': 'https://www.plataformadetransparencia.org.mx/sisai/solicitudes'
		};

		// Make the request to the external API
		const response = await fetch(
			'https://www.plataformadetransparencia.org.mx/inai3/rest/sujetosObligados/misSolicitudes/consultaSolicitudDetalleSICOM',
			{
				method: 'POST',
				headers: headers,
				body: JSON.stringify(payload)
			}
		);

		// Check if the response is ok
		if (!response.ok) {
			return json(
				{ 
					error: 'External API request failed',
					status: response.status,
					statusText: response.statusText
				},
				{ status: response.status }
			);
		}

		// Parse and return the JSON response
		const data = await response.json();
		return json(data);

	} catch (error) {
		console.error('Error in obtener-detalle API:', error);
		return json(
			{ 
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
