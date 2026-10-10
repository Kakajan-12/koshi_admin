import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    description,
    actions,
}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
    );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-5 ${className}`}>{children}</div>;
}

// Пара «подпись — значение» для страниц просмотра
export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-900 sm:col-span-2">{children}</dd>
        </div>
    );
}

export function DetailList({ children }: { children: React.ReactNode }) {
    return <dl className="divide-y divide-slate-100">{children}</dl>;
}
