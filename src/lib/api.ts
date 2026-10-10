export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Пути загрузок в базе бывают с обратными слэшами (uploads\123.jpg) — приводим к URL
export const uploadUrl = (path?: string | null): string =>
    path ? `${API_URL}/${path.replace(/\\/g, "/").replace(/^\//, "")}` : "";

export const formatMoney = (value: number | string | null | undefined): string => {
    const n = Number(value ?? 0);
    return `£${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
};

export const formatDate = (value?: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value?: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
