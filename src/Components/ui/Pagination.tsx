import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

// Номера страниц с многоточиями: 1 … 4 5 6 … 12
function pageList(page: number, pages: number): (number | "…")[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
    const sorted = [...set].sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
        out.push(p);
    });
    return out;
}

export default function Pagination({
    page,
    pages,
    total,
    limit,
    onChange,
}: {
    page: number;
    pages: number;
    total: number;
    limit: number;
    onChange: (page: number) => void;
}) {
    if (total === 0) return null;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    const btn =
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

    return (
        <nav className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row" aria-label="Pagination">
            <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{from}–{to}</span> of <span className="font-medium text-slate-700">{total}</span>
            </p>
            {pages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className={`${btn} cursor-pointer text-slate-600 hover:bg-slate-100`}
                        onClick={() => onChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeftIcon className="size-4" />
                    </button>
                    {pageList(page, pages).map((p, i) =>
                        p === "…" ? (
                            <span key={`gap-${i}`} className="px-1 text-sm text-slate-400">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onChange(p)}
                                aria-current={p === page ? "page" : undefined}
                                className={`${btn} cursor-pointer ${p === page ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        className={`${btn} cursor-pointer text-slate-600 hover:bg-slate-100`}
                        onClick={() => onChange(page + 1)}
                        disabled={page >= pages}
                        aria-label="Next page"
                    >
                        <ChevronRightIcon className="size-4" />
                    </button>
                </div>
            )}
        </nav>
    );
}
