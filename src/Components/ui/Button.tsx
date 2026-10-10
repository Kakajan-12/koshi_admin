import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "danger" | "destructive" | "ghost" | "ghostDanger";
type Size = "sm" | "md";

const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
    "disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap";

const variants: Record<Variant, string> = {
    primary: "bg-brand-500 text-white shadow-sm hover:bg-brand-600",
    secondary: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900",
    danger: "bg-white text-red-600 border border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-200",
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ghostDanger: "text-red-600 hover:bg-red-50 hover:text-red-700",
};

const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", extra = "") =>
    `${base} ${variants[variant]} ${sizes[size]} ${extra}`;

type CommonProps = {
    variant?: Variant;
    size?: Size;
    icon?: React.ReactNode;
    loading?: boolean;
    className?: string;
    children?: React.ReactNode;
};

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string };

const Spinner = () => (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
);

export default function Button(props: ButtonProps | LinkProps) {
    const { variant = "primary", size = "md", icon, loading, className = "", children } = props;
    const cls = buttonClass(variant, size, className);
    const content = (
        <>
            {loading ? <Spinner /> : icon}
            {children}
        </>
    );

    if (props.href !== undefined) {
        return (
            <Link href={props.href} className={cls}>
                {content}
            </Link>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, size: _s, icon: _i, loading: _l, className: _c, children: _ch, ...rest } = props as ButtonProps;
    return (
        <button type="button" {...rest} disabled={rest.disabled || loading} className={cls}>
            {content}
        </button>
    );
}
