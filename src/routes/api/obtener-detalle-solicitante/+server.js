import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
	url: env.KV_REST_API_URL || '',
	token: env.KV_REST_API_TOKEN || ''
});

/**
 * Obtiene el detalle de una solicitud desde la perspectiva del solicitante en la PNT.
 *
 * Recibe un `idSolicitudDependencia` (entero) y un `token` Bearer, y los reenvía al
 * endpoint `obtenerDetalleSolicitud` de la PNT junto con `idOrganoGarante: 31`,
 * devolviendo la respuesta tal cual.
 * Guarda cada respuesta exitosa en Upstash Redis como registro de acceso
 * con la clave `obtener-detalle-solicitante:{id}:{timestamp}`.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {Promise<Response>} JSON con el detalle de la solicitud o un objeto de error.
 *
 * @example
 * // Request body
 * { "idSolicitudDependencia": 123456, "token": "eyJhbGci..." }
 *
 * // Success response: JSON del detalle de la solicitud (vista solicitante)
 * // Error responses:
 * //   400 - idSolicitudDependencia o token faltante
 * //   502 - fallo en la API externa
 * //   500 - error interno del servidor
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { idSolicitudDependencia, token } = body;

		if (!idSolicitudDependencia || !token) {
			return json(
				{ error: 'idSolicitudDependencia and token are required' },
				{ status: 400 }
			);
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
			Authorization: `Bearer ${token}`
		};

		const response = await fetch(
			'https://www.plataformadetransparencia.org.mx/inai3/rest/solicitantes/misSolicitudes/obtenerDetalleSolicitud',
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

		const timestamp = new Date().toISOString();
		await redis.set(
			`obtener-detalle-solicitante:${idSolicitudDependencia}:${timestamp}`,
			JSON.stringify({ timestamp, idSolicitudDependencia, data })
		);

		return json(data);
	} catch (error) {
		console.error('Error in obtener-detalle-solicitante API:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
