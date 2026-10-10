"use client";

import React, { useEffect, useId, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

// Выбор картинки с превью: показывает новый файл или текущую картинку с сервера
export default function ImageInput({
    file,
    onChange,
    currentUrl,
    required,
}: {
    file: File | null;
    onChange: (file: File | null) => void;
    currentUrl?: string;
    required?: boolean;
}) {
    const id = useId();
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shown = preview || currentUrl;

    return (
        <div className="flex items-center gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {shown ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shown} alt="" className="size-full object-cover" />
                ) : (
                    <PhotoIcon className="size-8 text-slate-300" />
                )}
            </div>
            <div className="min-w-0">
                <label
                    htmlFor={id}
                    className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    {shown ? "Change image" : "Choose image"}
                </label>
                <input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    required={required && !currentUrl && !file}
                    className="sr-only"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
                <p className={`mt-1.5 text-xs text-slate-500 ${file ? "truncate" : ""}`}>
                    {file ? file.name : "JPEG, PNG, WebP or GIF, up to 10 MB"}
                </p>
            </div>
        </div>
    );
}
