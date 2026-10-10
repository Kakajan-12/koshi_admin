import React from "react";

export const inputClass =
    "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
    "placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 " +
    "disabled:bg-slate-50 disabled:text-slate-500";

export function Field({
    label,
    htmlFor,
    hint,
    required,
    children,
    className = "",
}: {
    label: string;
    htmlFor?: string;
    hint?: React.ReactNode;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
                {required && <span className="ml-0.5 text-brand-500">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea rows={4} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${inputClass} pr-8 ${props.className ?? ""}`} />;
}

export function Checkbox({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
    return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
                type="checkbox"
                {...props}
                className="size-4 cursor-pointer rounded border-slate-300 accent-brand-500"
            />
            {label}
        </label>
    );
}

// Сообщение об ошибке над формой или списком
export function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" }) {
    const styles =
        tone === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700";
    return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

// Нижняя панель формы с кнопками
export function FormActions({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            {children}
        </div>
    );
}
