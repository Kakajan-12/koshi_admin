"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";
import Button from "@/Components/ui/Button";
import { Card, CardBody, CardHeader } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog } from "@/Components/ui/Feedback";
import MultiImageInput from "@/Components/ui/MultiImageInput";
import { uploadUrl } from "@/lib/api";
import { GalleryPhoto, uploadGalleryPhotos } from "@/lib/gallery";
import { api, errorMessage } from "@/lib/http";

// Дополнительные фото товара (галерея на странице товара): просмотр, добавление нескольких сразу, удаление
export default function ProductGalleryManager({ productId }: { productId: number | string }) {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<GalleryPhoto | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        try {
            const all = await api<GalleryPhoto[]>("/api/product-gallery");
            setPhotos(all.filter((p) => String(p.product_id) === String(productId)));
        } catch (err) {
            setError(errorMessage(err, "Could not load photos"));
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        load();
    }, [load]);

    const upload = async () => {
        setError(null);
        setProgress({ done: 0, total: newFiles.length });
        const { failed } = await uploadGalleryPhotos(productId, newFiles, (done, total) => setProgress({ done, total }));
        setProgress(null);
        // Неудавшиеся оставляем выбранными, чтобы можно было повторить
        setNewFiles(newFiles.filter((f) => failed.some((x) => x.name === f.name)));
        if (failed.length) setError(failed.map((f) => `${f.name}: ${f.error}`).join(" · "));
        await load();
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            await api(`/api/product-gallery/${pendingDelete.id}`, { method: "DELETE" });
            setPhotos((prev) => prev.filter((p) => p.id !== pendingDelete.id));
        } catch (err) {
            setError(errorMessage(err, "Could not delete photo"));
        } finally {
            setDeleting(false);
            setPendingDelete(null);
        }
    };

    return (
        <Card>
            <CardHeader title="Gallery photos" description="Extra photos shown after the main image on the product page." />
            <CardBody className="space-y-5">
                {error && <Alert>{error}</Alert>}

                {loading ? (
                    <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {photos.map((p) => (
                            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={uploadUrl(p.image)} alt="" className="size-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setPendingDelete(p)}
                                    aria-label="Delete photo"
                                    className="absolute right-1.5 top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-red-600 opacity-0 shadow-sm transition-opacity hover:bg-white focus:opacity-100 group-hover:opacity-100"
                                >
                                    <TrashIcon className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No extra photos yet — the product page shows only the main image.</p>
                )}

                <div className="border-t border-slate-100 pt-5">
                    <MultiImageInput files={newFiles} onChange={setNewFiles} disabled={!!progress} />
                    {newFiles.length > 0 && (
                        <div className="mt-4 flex items-center justify-end gap-2">
                            {!progress && (
                                <Button variant="secondary" size="sm" onClick={() => setNewFiles([])}>
                                    Clear
                                </Button>
                            )}
                            <Button size="sm" onClick={upload} loading={!!progress}>
                                {progress
                                    ? `Uploading ${progress.done} of ${progress.total}…`
                                    : `Upload ${newFiles.length} ${newFiles.length === 1 ? "photo" : "photos"}`}
                            </Button>
                        </div>
                    )}
                </div>
            </CardBody>

            <ConfirmDialog
                open={!!pendingDelete}
                title="Delete photo?"
                description="The photo will be removed from the product page."
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </Card>
    );
}
