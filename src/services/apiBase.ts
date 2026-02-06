import {getCookie} from "../utils/cookies.ts";

const API_URL = import.meta.env.VITE_API_URL;

export function getAuthHeaders(): HeadersInit {
    const token = getCookie("access_token");
    const headers: HeadersInit = {"Content-Type": "application/json"};
    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export const API_BASE = API_URL;

const TOKEN_EXPIRED_EVENT = "auth:tokenExpired";

function dispatchTokenExpired(): void {
    window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT));
}

export async function apiFetch(
    url: string,
    init?: RequestInit
): Promise<Response> {
    const headers = new Headers(getAuthHeaders());
    const initHeaders = new Headers(init?.headers);
    initHeaders.forEach((value, key) => headers.set(key, value));

    const res = await fetch(url, { ...init, headers });
    if (res.status === 401) {
        dispatchTokenExpired();
    }
    return res;
}
