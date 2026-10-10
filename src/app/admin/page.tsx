'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BanknotesIcon,
    CakeIcon,
    ClockIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card, CardHeader } from "@/Components/ui/Card";
import { Badge, EmptyState, ErrorState, LoadingState, StatCard } from "@/Components/ui/Feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { formatDateTime, formatMoney } from "@/lib/api";
import { useRecord } from "@/lib/useRecord";
import { customerOf, Order, statusLabel, statusTone } from "./orders/orderUtils";

type ProductCounts = { counts: { all: number; in_stock: number; pre_order: number } };
type Period = { count: number; revenue: number };
type OrderStats = { today: Period; week: Period; month: Period; pending: number };

// Границы периодов считаем в часовом поясе админа (пекарни), а не сервера; один раз при открытии
const statsPath = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const sp = new URLSearchParams({
        todayStart: today.toISOString(),
        weekStart: week.toISOString(),
        monthStart: month.toISOString(),
    });
    return `/api/admin/orders/stats?${sp}`;
};

const AdminDashboard = () => {
    const router = useRouter();
    const [path] = useState(statsPath);
    const stats = useRecord<OrderStats>(path);
    const recentOrders = useRecord<{ items: Order[] }>("/api/admin/orders?limit=6");
    // Только счётчики меню — без загрузки всего каталога
    const products = useRecord<ProductCounts>("/api/admin/products?limit=1");

    const now = new Date();
    const s = stats.data;
    const recent = recentOrders.data?.items ?? [];
    const menu = products.data?.counts;

    const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

    return (
        <AdminShell>
            <PageHeader
                title={greeting}
                description={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                actions={
                    <>
                        <Button variant="secondary" href="/admin/orders">View orders</Button>
                        <Button href="/admin/products/add-product" icon={<PlusIcon className="size-4" />}>Add product</Button>
                    </>
                }
            />

            {stats.error ? (
                <Card className="mb-6"><ErrorState message={stats.error} /></Card>
            ) : (
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Orders today"
                        value={s ? s.today.count : "…"}
                        hint={s ? `${formatMoney(s.today.revenue)} paid` : undefined}
                        icon={<ShoppingBagIcon className="size-5" />}
                    />
                    <StatCard
                        label="Revenue, last 7 days"
                        value={s ? formatMoney(s.week.revenue) : "…"}
                        hint={s ? `${s.week.count} paid orders` : undefined}
                        icon={<BanknotesIcon className="size-5" />}
                    />
                    <StatCard
                        label={`Revenue, ${now.toLocaleDateString("en-GB", { month: "long" })}`}
                        value={s ? formatMoney(s.month.revenue) : "…"}
                        hint={s ? `${s.month.count} paid orders` : undefined}
                        icon={<BanknotesIcon className="size-5" />}
                    />
                    <StatCard
                        label="Awaiting payment"
                        value={s ? s.pending : "…"}
                        hint="Checkout started but not paid"
                        icon={<ClockIcon className="size-5" />}
                    />
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Recent orders"
                        actions={<Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>}
                    />
                    {recentOrders.loading ? (
                        <LoadingState rows={4} />
                    ) : recentOrders.error ? (
                        <ErrorState message={recentOrders.error} />
                    ) : recent.length === 0 ? (
                        <EmptyState title="No orders yet" description="New orders will appear here." />
                    ) : (
                        <Table>
                            <THead>
                                <TH>Order</TH>
                                <TH>Customer</TH>
                                <TH>Status</TH>
                                <TH align="right">Total</TH>
                            </THead>
                            <TBody>
                                {recent.map((o) => (
                                    <TR key={o.id} onClick={() => router.push(`/admin/orders/view-orders/${o.id}`)}>
                                        <TD>
                                            <p className="font-medium text-slate-900">#{o.id}</p>
                                            <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p>
                                        </TD>
                                        <TD>{customerOf(o).name}</TD>
                                        <TD><Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge></TD>
                                        <TD align="right" className="font-medium text-slate-900">{formatMoney(o.total)}</TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Menu" />
                        <div className="p-5">
                            {products.loading || !menu ? (
                                <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50">
                                        <CakeIcon className="size-6 text-brand-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-slate-900">{menu.all}</p>
                                        <p className="text-sm text-slate-500">
                                            {menu.in_stock} in stock · {menu.pre_order} pre-order
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Quick actions" />
                        <div className="grid gap-1 p-2">
                            {[
                                { href: "/admin/products/add-product", label: "Add a product" },
                                { href: "/admin/sliders/add-slider", label: "Add a home page slide" },
                                { href: "/admin/testimonials/add-testimonials", label: "Add a testimonial" },
                                { href: "/admin/open-time", label: "Update opening hours" },
                            ].map((a) => (
                                <Link
                                    key={a.href}
                                    href={a.href}
                                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    {a.label}
                                    <span aria-hidden className="text-slate-400">→</span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
};

export default AdminDashboard;
