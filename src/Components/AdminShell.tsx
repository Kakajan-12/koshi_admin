"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    CakeIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    HomeIcon,
    LinkIcon,
    MapPinIcon,
    RectangleStackIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    SparklesIcon,
    Squares2X2Icon,
    TagIcon,
    UsersIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { API_URL } from "@/lib/api";
import { NavBadges, useNavBadges } from "@/lib/navBadges";

// badge — какой счётчик показывать у пункта (lib/navBadges.ts)
type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: keyof NavBadges };

const navGroups: { title?: string; items: NavItem[] }[] = [
    {
        items: [
            { href: "/admin", label: "Overview", icon: HomeIcon },
            { href: "/admin/orders", label: "Orders", icon: ShoppingBagIcon, badge: "orders" },
            { href: "/admin/custom-orders", label: "Custom orders", icon: SparklesIcon, badge: "customOrders" },
            { href: "/admin/users", label: "Users", icon: UsersIcon },
        ],
    },
    {
        title: "Catalog",
        items: [
            { href: "/admin/products", label: "Products", icon: CakeIcon },
            { href: "/admin/product-category", label: "Categories", icon: Squares2X2Icon },
            { href: "/admin/product-types", label: "Types", icon: TagIcon },
            { href: "/admin/allergens", label: "Allergens", icon: ShieldExclamationIcon },
        ],
    },
    {
        title: "Website",
        items: [
            { href: "/admin/sliders", label: "Hero slides", icon: RectangleStackIcon },
            { href: "/admin/testimonials", label: "Testimonials", icon: ChatBubbleLeftRightIcon },
        ],
    },
    {
        title: "Contacts",
        items: [
            { href: "/admin/contact", label: "Contact details", icon: MapPinIcon },
            { href: "/admin/social-links", label: "Social links", icon: LinkIcon },
            { href: "/admin/open-time", label: "Opening hours", icon: ClockIcon },
        ],
    },
];

function useSession() {
    const router = useRouter();
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    useEffect(() => {
        // Токен в httpOnly-cookie странице недоступен, поэтому сессию проверяет сервер
        fetch(`${API_URL}/api/auth/login/me`, { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) {
                    router.replace("/");
                    return;
                }
                const data: { exp: number } = await res.json();
                setExpiresAt(new Date(data.exp * 1000));
            })
            .catch(() => router.replace("/"));
    }, [router]);

    const logout = async () => {
        // Cookie с токеном httpOnly — удалить её может только сервер
        await fetch(`${API_URL}/api/auth/login/logout`, { method: "POST", credentials: "include" }).catch(() => {});
        router.push("/");
    };

    return { expiresAt, logout };
}

function Brand() {
    return (
        <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
                K
            </span>
            <span className="leading-tight">
                <span className="block text-sm font-semibold text-slate-900">Koşi Bakery</span>
                <span className="block text-xs text-slate-500">Admin</span>
            </span>
        </Link>
    );
}

const BADGE_HINT: Record<keyof NavBadges, string> = {
    orders: "new paid orders",
    customOrders: "new custom order requests",
};

function Nav({ onNavigate, badges }: { onNavigate?: () => void; badges: NavBadges | null }) {
    const pathname = usePathname();
    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {navGroups.map((group, i) => (
                <div key={i}>
                    {group.title && (
                        <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                            {group.title}
                        </p>
                    )}
                    <ul className="space-y-0.5">
                        {group.items.map(({ href, label, icon: Icon, badge }) => {
                            const active = isActive(href);
                            const count = badge && badges ? badges[badge] : 0;
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        onClick={onNavigate}
                                        aria-current={active ? "page" : undefined}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            active
                                                ? "bg-brand-50 text-brand-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <Icon className={`size-5 ${active ? "text-brand-500" : "text-slate-400"}`} />
                                        <span className="flex-1">{label}</span>
                                        {badge && count > 0 && (
                                            <span
                                                className="min-w-5 rounded-full bg-brand-500 px-1.5 py-0.5 text-center text-xs font-semibold leading-none text-white tabular-nums"
                                                title={`${count} ${BADGE_HINT[badge]}`}
                                            >
                                                {count > 99 ? "99+" : count}
                                                <span className="sr-only"> {BADGE_HINT[badge]}</span>
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

function SidebarFooter({ expiresAt, onLogout }: { expiresAt: Date | null; onLogout: () => void }) {
    return (
        <div className="border-t border-slate-200 p-3">
            {expiresAt && (
                <p className="px-3 pb-2 text-xs text-slate-400">
                    Session until{" "}
                    {expiresAt.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
            )}
            <button
                type="button"
                onClick={onLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
                <ArrowRightStartOnRectangleIcon className="size-5 text-slate-400" />
                Log out
            </button>
        </div>
    );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { expiresAt, logout } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const badges = useNavBadges();
    const hasNew = !!badges && badges.orders + badges.customOrders > 0;

    // Закрываем мобильное меню при переходе на другую страницу
    useEffect(() => setMobileOpen(false), [pathname]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Меню на десктопе */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
                <div className="flex h-16 items-center px-6">
                    <Brand />
                </div>
                <Nav badges={badges} />
                <SidebarFooter expiresAt={expiresAt} onLogout={logout} />
            </aside>

            {/* Верхняя панель и выезжающее меню на мобильных */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
                <Brand />
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label={hasNew ? "Open menu (new orders)" : "Open menu"}
                >
                    <Bars3Icon className="size-6" />
                    {/* На телефоне меню свёрнуто — точка подсказывает, что внутри есть новые заказы */}
                    {hasNew && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-brand-500 ring-2 ring-white" aria-hidden="true" />}
                </button>
            </header>
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
                        <div className="flex h-14 items-center justify-between px-4">
                            <Brand />
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                aria-label="Close menu"
                            >
                                <XMarkIcon className="size-6" />
                            </button>
                        </div>
                        <Nav onNavigate={() => setMobileOpen(false)} badges={badges} />
                        <SidebarFooter expiresAt={expiresAt} onLogout={logout} />
                    </aside>
                </div>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
            </main>
        </div>
    );
}

// Заголовок страницы: название, пояснение, кнопки справа и ссылка «назад»
export function PageHeader({
    title,
    description,
    actions,
    back,
}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    back?: { href: string; label: string };
}) {
    return (
        <div className="mb-6">
            {back && (
                <Link
                    href={back.href}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
                >
                    <span aria-hidden>←</span> {back.label}
                </Link>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
