"use client";

import React, { useEffect, useId, useState } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

// Выбор нескольких картинок с превью; повторный выбор добавляет к уже выбранным
export default function MultiImageInput({
    files,
    onChange,
    disabled,
}: {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
}) {
    const id = useId();
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
                {previews.map((url, i) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="size-full object-cover" />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => onChange(files.filter((_, j) => j !== i))}
                                aria-label={`Remove ${files[i]?.name}`}
                                className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-600 shadow-sm hover:text-slate-900"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        )}
                    </div>
                ))}
                <label
                    htmlFor={id}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition-colors ${
                        disabled ? "opacity-50" : "cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600"
                    }`}
                >
                    <PhotoIcon className="size-6" />
                    <span className="text-xs font-medium">Add photos</span>
                </label>
            </div>
            <input
                id={id}
                type="file"
                accept={ACCEPT}
                multiple
                disabled={disabled}
                className="sr-only"
                onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    if (picked.length) onChange([...files, ...picked]);
                    e.target.value = "";
                }}
            />
            <p className="mt-2 text-xs text-slate-500">You can select several photos at once. JPEG, PNG, WebP or GIF, up to 10 MB each.</p>
        </div>
    );
}
