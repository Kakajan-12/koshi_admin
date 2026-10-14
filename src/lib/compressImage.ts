// Сжатие фотографий в браузере перед загрузкой.
// На сервере sharp не работает (процессор хостинга его не поддерживает), а nginx принимает запросы
// только до 1 МБ (client_max_body_size 1m) — поэтому фото уменьшаем здесь: до 2000 px по длинной
// стороне, в WebP (или JPEG, если браузер не умеет кодировать WebP), пока файл не станет меньше MAX_BYTES.

// С запасом под остальные поля формы: весь запрос должен уложиться в 1 МБ
export const MAX_UPLOAD_BYTES = 800 * 1024;
const MAX_SIDE = 2000;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];

export class ImageTooLargeError extends Error {}

const loadImage = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
    if (typeof createImageBitmap === "function") {
        try {
            return await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch {
            // старый браузер или формат — пробуем через <img>
        }
    }
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Возвращает файл не больше MAX_UPLOAD_BYTES. Маленькие файлы не трогает.
 * GIF не пережимается (анимация пропала бы) — слишком большой GIF даёт ImageTooLargeError.
 */
export async function compressImage(file: File, maxBytes = MAX_UPLOAD_BYTES): Promise<File> {
    if (!file.type.startsWith("image/") || file.size <= maxBytes) return file;
    if (file.type === "image/gif") {
        throw new ImageTooLargeError(`GIF images must be under ${Math.round(maxBytes / 1024)} KB. Please use a JPEG, PNG or WebP photo instead.`);
    }

    let image: ImageBitmap | HTMLImageElement;
    try {
        image = await loadImage(file);
    } catch {
        throw new ImageTooLargeError("This image couldn't be read. Please choose a JPEG, PNG or WebP photo.");
    }
    const width = "naturalWidth" in image ? image.naturalWidth : image.width;
    const height = "naturalHeight" in image ? image.naturalHeight : image.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    let scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    let best: Blob | null = null;
    // Сначала снижаем качество, потом — размер, пока не уложимся
    for (let step = 0; step < 6; step++) {
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        // Белый фон: у PNG с прозрачностью в JPEG иначе получится чёрный фон
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        for (const quality of QUALITIES) {
            let blob = await toBlob(canvas, "image/webp", quality);
            // Safari старых версий вместо WebP отдаёт PNG — тогда JPEG
            if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
            if (!blob) continue;
            if (!best || blob.size < best.size) best = blob;
            if (blob.size <= maxBytes) {
                if ("close" in image) image.close();
                const ext = blob.type === "image/webp" ? "webp" : "jpg";
                return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.${ext}`, { type: blob.type });
            }
        }
        scale *= 0.75;
    }
    if ("close" in image) image.close();
    throw new ImageTooLargeError("This image is too large even after compression. Please choose a smaller photo.");
}
