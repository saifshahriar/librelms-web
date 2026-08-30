export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

export interface StrapiResponse<T> {
	data: T;
	meta?: Record<string, unknown>;
}

// Mock API is opt-in: only an explicit NEXT_PUBLIC_USE_MOCK=true build
// uses it. Production builds with just NEXT_PUBLIC_API_URL always hit
// the real backend.
const MOCK_ENABLED = process.env.NEXT_PUBLIC_USE_MOCK === "true";

let token: string | null = null;

export function setAuthToken(t: string | null) {
	token = t;
}

export function getAuthToken() {
	return token;
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	if (MOCK_ENABLED) {
		const { mockRequest } = await import("./mock/handler");
		return mockRequest<T>(path, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...init?.headers,
			},
		});
	}

	const base = process.env.NEXT_PUBLIC_API_URL ?? "";
	const isForm =
		typeof FormData !== "undefined" && init?.body instanceof FormData;
	const res = await fetch(`${base}${path}`, {
		...init,
		headers: {
			...(isForm ? {} : { "Content-Type": "application/json" }),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init?.headers,
		},
	});

	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const body = (await res.json()) as {
				error?: { message?: string };
				message?: string;
			};
			message = body.error?.message ?? body.message ?? message;
		} catch {
			// keep default message
		}
		throw new ApiError(res.status, message);
	}

	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}
