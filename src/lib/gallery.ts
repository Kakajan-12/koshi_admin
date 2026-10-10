import { api } from "./http";

export type GalleryPhoto = { id: number; image: string; product_id: number; product_name?: string };

// Фото галереи загружаются по одному запросу на файл (так устроен API).
// Возвращает, сколько загрузилось, и ошибки по именам файлов.
export async function uploadGalleryPhotos(
    productId: number | string,
    files: File[],
    onProgress?: (done: number, total: number) => void
): Promise<{ uploaded: GalleryPhoto[]; failed: { name: string; error: string }[] }> {
    const uploaded: GalleryPhoto[] = [];
    const failed: { name: string; error: string }[] = [];
    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);
        formData.append("product_id", String(productId));
        try {
            uploaded.push(await api<GalleryPhoto>("/api/product-gallery", { method: "POST", form: formData }));
        } catch (err) {
            failed.push({ name: files[i].name, error: err instanceof Error ? err.message : "Upload failed" });
        }
        onProgress?.(i + 1, files.length);
    }
    return { uploaded, failed };
}
