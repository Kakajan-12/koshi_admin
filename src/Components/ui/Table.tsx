import React from "react";

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export function Table({ children }: { children: React.ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
        </div>
    );
}

export function THead({ children }: { children: React.ReactNode }) {
    return (
        <thead className="bg-slate-50">
            <tr>{children}</tr>
        </thead>
    );
}

export function TH({ children, align = "left", className = "" }: { children?: React.ReactNode; align?: "left" | "right" | "center"; className?: string }) {
    return (
        <th
            scope="col"
            className={`px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 ${alignClass[align]} ${className}`}
        >
            {children}
        </th>
    );
}

export function TBody({ children }: { children: React.ReactNode }) {
    return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TR({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <tr onClick={onClick} className={`transition-colors hover:bg-slate-50/70 ${onClick ? "cursor-pointer" : ""}`}>
            {children}
        </tr>
    );
}

export function TD({ children, align = "left", className = "" }: { children?: React.ReactNode; align?: "left" | "right" | "center"; className?: string }) {
    return <td className={`px-5 py-3.5 text-slate-700 ${alignClass[align]} ${className}`}>{children}</td>;
}

// Миниатюра картинки в строке таблицы
export function Thumb({ src, alt = "" }: { src?: string; alt?: string }) {
    return (
        <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className="size-full object-cover" />
            )}
        </div>
    );
}

// Кнопки «редактировать / удалить» в конце строки
export function RowActions({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-end gap-1">{children}</div>;
}
