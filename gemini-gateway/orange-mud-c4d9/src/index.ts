import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface Env {
	GEMINI_API_KEY: string;
	FIREBASE_PROJECT_ID: string;
	ALLOWED_ORIGIN: string;
}

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

function jsonResponse(body: unknown, status = 200, origin = '*') {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
		},
	});
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const origin = env.ALLOWED_ORIGIN || '*';
		const url = new URL(request.url);

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
				},
			});
		}

		if (request.method !== 'POST' || url.pathname !== '/simulate') {
			return jsonResponse({ error: 'Not Found' }, 404, origin);
		}

		// 1) Auth: ambil Firebase ID token dari header Authorization
		const authHeader = request.headers.get('Authorization') || '';
		const match = authHeader.match(/^Bearer\s+(.+)$/i);
		if (!match) return jsonResponse({ error: 'Missing Authorization Bearer token' }, 401, origin);

		const idToken = match[1];
		const projectId = env.FIREBASE_PROJECT_ID;
		const issuer = `https://securetoken.google.com/${projectId}`;

		let uid = '';
		try {
			const verified = await jwtVerify(idToken, JWKS, {
				issuer,
				audience: projectId,
			});
			uid = String(verified.payload.sub || '');
			if (!uid) throw new Error('No sub');
		} catch {
			return jsonResponse({ error: 'Invalid/expired token' }, 401, origin);
		}

		// 2) Input validation
		const body = await request.json().catch(() => ({}));
		const input = String((body as any)?.input ?? '').trim();

		if (input.length < 10) {
			return jsonResponse({ error: 'Input terlalu pendek (min 10 karakter).' }, 400, origin);
		}
		if (input.length > 1500) {
			return jsonResponse({ error: 'Input terlalu panjang (maks 1500 karakter).' }, 400, origin);
		}

		// 3) Prompt
		const prompt = `
Kamu adalah asisten simulasi iklim untuk siswa SMA.
Berikan simulasi dampak dari rencana aksi berikut.

Rencana aksi siswa:
"${input}"

Balas dalam JSON valid (tanpa markdown/backticks) dengan schema:
{
  "ringkasan": string,
  "estimasi": {
    "penyerapan_co2_kg_per_tahun": number|null,
    "potensi_penurunan_suhu_c": number|null,
    "catatan": string
  },
  "asumsi": string[],
  "keterbatasan": string[],
  "saran_lanjutan": string[]
}

Aturan:
- Jika angka tidak bisa diperkirakan dengan wajar, isi null dan jelaskan alasannya di "catatan".
- Tegaskan ini estimasi berbasis asumsi, bukan pengukuran lapangan/prediksi pasti.
- Bahasa Indonesia yang edukatif.
`.trim();

		const apiKey = env.GEMINI_API_KEY;
		const geminiUrl =
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(apiKey);

		const geminiResp = await fetch(geminiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
			}),
		});

		if (!geminiResp.ok) {
			const errText = await geminiResp.text();
			return jsonResponse({ error: 'Gemini API error', detail: errText }, 500, origin);
		}

		const data: any = await geminiResp.json();
		const rawText: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? '').join('') ?? '';

		if (!rawText) {
			return jsonResponse({ error: 'Empty response from Gemini' }, 500, origin);
		}

		let parsed: any = null;
		try {
			parsed = JSON.parse(rawText);
		} catch {
			parsed = null;
		}

		return jsonResponse({ uid, rawText, parsed }, 200, origin);
	},
};
