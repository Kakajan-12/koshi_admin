import type { NextConfig } from "next";

// Картинки грузятся с API (/uploads). Адрес берём из NEXT_PUBLIC_API_URL,
// чтобы не переключать конфиг руками между localhost и продом.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

const uploadsPattern = {
    protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
    hostname: apiUrl.hostname,
    port: apiUrl.port,
    pathname: "/uploads/**",
};

// С Next 16 оптимизатор картинок не скачивает их с локальных адресов (защита от SSRF).
// Разрешаем это только в разработке, когда сам API локальный; на проде защита остаётся.
const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname);

// Защитные заголовки для всех страниц: админку нельзя встроить в чужой фрейм (кликджекинг),
// браузер не угадывает тип файлов, в чужие сайты не уходит адрес страницы,
// поисковики не индексируют, а HTTPS запоминается на год. На localhost браузеры HSTS игнорируют.
const securityHeaders = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
    poweredByHeader: false,
    images: {
        remotePatterns: [uploadsPattern],
        dangerouslyAllowLocalIP: isLocalApi,
    },
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
};

export default nextConfig;
