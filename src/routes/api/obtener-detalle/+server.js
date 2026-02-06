import { json } from '@sveltejs/kit';

/**
 * Consulta el detalle de una solicitud en la Plataforma Nacional de Transparencia (PNT).
 *
 * Recibe un `idSolicitudDependencia` (entero) y lo reenvía al endpoint SICOM de la PNT
 * junto con `idOrganoGarante: 31`, devolviendo la respuesta tal cual.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {Promise<Response>} JSON con el detalle de la solicitud o un objeto de error.
 *
 * @example
 * // Request body
 * { "idSolicitudDependencia": 123456 }
 *
 * // Success response: JSON del detalle de la solicitud
 * // Error responses:
 * //   400 - idSolicitudDependencia faltante
 * //   502 - fallo en la API externa
 * //   500 - error interno del servidor
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { idSolicitudDependencia } = body;

		if (!idSolicitudDependencia) {
			return json({ error: 'idSolicitudDependencia is required' }, { status: 400 });
		}

		const payload = {
			idSolicitudDependencia: idSolicitudDependencia,
			idOrganoGarante: 31
		};

		const headers = {
			Host: 'www.plataformadetransparencia.org.mx',
			'Sec-Ch-Ua-Platform': '"Windows"',
			'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144"',
			'Sec-Ch-Ua-Mobile': '?0',
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json',
			'Accept-Language': 'es-419,es;q=0.9',
			'Accept-Encoding': 'gzip, deflate, br',
			Priority: 'u=1, i',
			Referer: 'https://www.plataformadetransparencia.org.mx/sisai/solicitudes',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
			Authorization:
				'Bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJkYTk4N2MxMS0zZTZmLTQ2OTYtYTJhOS1lYzY2ZTBmZTI5OTMiLCJpYXQiOjE3NzAzOTUxMjYsInN1YiI6Im1hdXJpY2lvLm1vcmVuby5tQGhvdG1haWwuY29tIiwiZGF0YSI6eyJzY3JlZW5OYW1lIjpudWxsLCJpZFVzZXIiOiI5VjlmOXMxRlFGWnAvckpFTlIwTlVnPT0iLCJpZE9yZ2Fub0dhcmFudGUiOiIiLCJpZFN1amV0b09ibGlnYWRvIjoiIiwiaWRVbmlkYWRBZG1pbmlzdHJhdGl2YSI6IiIsImlkU3ViRW5sYWNlIjoiIiwiaWRVbmlkYWRFbmxhY2UiOiIifSwiZXhwIjoxNzcwNDIzOTI2fQ.C_qmBKJIFwhyE-9JHhMxriG2NtkNIyJV8pDaiI0Xs7I'
		};

		const response = await fetch(
			'https://www.plataformadetransparencia.org.mx/inai3/rest/sujetosObligados/misSolicitudes/consultaSolicitudDetalleSICOM',
			{
				method: 'POST',
				headers: headers,
				body: JSON.stringify(payload)
			}
		);

		if (!response.ok) {
			return json(
				{
					error: 'External API request failed',
					status: response.status,
					statusText: response.statusText
				},
				{ status: 502 }
			);
		}

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
