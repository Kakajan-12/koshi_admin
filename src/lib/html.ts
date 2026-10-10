import DOMPurify from "dompurify";

// Те же правила, что на сайте (koshi_frontend/src/lib/html.ts): HTML из базы вставляем только очищенным.
// Даже в админке: если в базу попадёт вредный HTML (взлом, импорт), он не должен выполниться у администратора.

const ENTITIES: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
};

// HTML → обычный текст (например, имя автора отзыва из редактора)
export const htmlToText = (html?: string | null): string =>
    (html ?? "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(p|li|h[1-6])>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
        .replace(/\s+/g, " ")
        .trim();

// Текст из редактора TipTap: убираем скрипты, обработчики (onerror=...) и javascript:-ссылки
export const safeHtml = (html?: string | null): string =>
    typeof window === "undefined" || !html ? "" : DOMPurify.sanitize(html);

// Код встраивания карты: берём только адрес Google Maps, остальной HTML отбрасываем
export const mapEmbedSrc = (html?: string | null): string | null => {
    const src = html?.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src) return null;
    try {
        const url = new URL(src.replace(/&amp;/g, "&"));
        const isGoogle = url.hostname === "www.google.com" || url.hostname === "maps.google.com";
        return url.protocol === "https:" && isGoogle && url.pathname.startsWith("/maps/embed") ? url.href : null;
    } catch {
        return null;
    }
};
