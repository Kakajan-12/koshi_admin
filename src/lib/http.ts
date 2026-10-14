import { API_URL } from "./api";
import { compressImage } from "./compressImage";

export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

type Options = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    // Обычное тело запроса (JSON) или FormData для загрузки файлов
    json?: unknown;
    form?: FormData;
};

// Фотографии в форме сжимаем до загрузки (lib/compressImage.ts): сервер принимает запросы до 1 МБ
async function compressForm(form: FormData): Promise<FormData> {
    const out = new FormData();
    for (const [key, value] of form.entries()) {
        if (value instanceof File) {
            const file = await compressImage(value);
            out.append(key, file, file.name);
        } else {
            out.append(key, value);
        }
    }
    return out;
}

// Запрос к API админки: cookie с токеном, разбор JSON, понятные ошибки.
// 401 — сессия истекла, отправляем на страницу входа.
export async function api<T = unknown>(path: string, { method = "GET", json, form }: Options = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        credentials: "include",
        headers: json !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: json !== undefined ? JSON.stringify(json) : form && (await compressForm(form)),
    });

    // Ответ nginx, а не API: запрос больше client_max_body_size
    if (res.status === 413) throw new ApiError("The image is too large. Please choose a smaller photo.", 413);

    if (res.status === 401) {
        if (typeof window !== "undefined") window.location.assign("/");
        throw new ApiError("Your session has expired. Please sign in again.", 401);
    }

    const text = await res.text();
    let data: unknown = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const message =
            (data && typeof data === "object" && ("error" in data || "message" in data)
                ? String((data as { error?: string; message?: string }).error ?? (data as { message?: string }).message)
                : null) || `Request failed (${res.status})`;
        throw new ApiError(message, res.status);
    }

    return data as T;
}

export const errorMessage = (err: unknown, fallback = "Something went wrong") =>
    err instanceof Error && err.message ? err.message : fallback;
