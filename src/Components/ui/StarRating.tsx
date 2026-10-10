"use client";

import React, { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";

const STARS = [1, 2, 3, 4, 5];

// Звёзды для показа оценки; null — оценки нет
export function Stars({ value, size = "size-4" }: { value: number | null | undefined; size?: string }) {
    if (!value) return <span className="text-sm text-slate-400">No rating</span>;
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`} title={`${value} / 5`}>
            {STARS.map((n) => (
                <StarIcon key={n} className={`${size} ${n <= value ? "text-amber-400" : "text-slate-200"}`} aria-hidden />
            ))}
        </span>
    );
}

// Выбор оценки кликом по звезде; повторный клик по выбранной снимает оценку
export function StarRatingInput({
    value,
    onChange,
}: {
    value: number | null;
    onChange: (value: number | null) => void;
}) {
    const [hover, setHover] = useState<number | null>(null);
    const shown = hover ?? value ?? 0;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(null)}>
                {STARS.map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                        onClick={() => onChange(value === n ? null : n)}
                        onMouseEnter={() => setHover(n)}
                        className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110"
                    >
                        <StarIcon className={`size-7 ${n <= shown ? "text-amber-400" : "text-slate-200"}`} />
                    </button>
                ))}
            </div>
            <span className="text-sm text-slate-500">{value ? `${value} / 5` : "No rating"}</span>
        </div>
    );
}
