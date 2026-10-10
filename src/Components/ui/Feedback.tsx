"use client";

import React, { useEffect } from "react";
import { ExclamationTriangleIcon, InboxIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
    brand: "bg-brand-50 text-brand-700 ring-brand-500/20",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
            {children}
        </span>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-slate-100">
                <InboxIcon className="size-5 text-slate-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-red-50">
                <ExclamationTriangleIcon className="size-5 text-red-500" />
            </div>
            <p className="mt-3 text-sm text-slate-700">{message}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Delete",
    loading,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) onCancel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={() => !loading && onCancel()} />
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <ExclamationTriangleIcon className="size-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function StatCard({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                {icon && <div className="text-slate-400">{icon}</div>}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
    );
}
