"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import { Card } from "@/Components/ui/Card";
import { Input } from "@/Components/ui/Form";
import { Badge, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import Pagination from "@/Components/ui/Pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { formatDateTime, formatMoney } from "@/lib/api";
import { api, errorMessage } from "@/lib/http";
import { customerOf, daysUntilReady, Order, orderData, orderTypeLabel, readyLabel, statusLabel, statusTone } from "./orderUtils";

const PAGE_SIZE = 20;

const FILTERS = [
    { value: "", label: "All", countKey: "all" },
    { value: "paid", label: "Paid", countKey: "paid" },
    { value: "pending", label: "Awaiting payment", countKey: "pending" },
    { value: "failed", label: "Failed", countKey: "failed" },
] as const;

type OrdersPage = {
    items: Order[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    counts: { all: number; paid: number; pending: number; failed: number };
};

function OrdersList() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // Страница, фильтр и поиск живут в адресе — «назад» из заказа возвращает туда же
    const page = Math.max(1, Number(params.get("page")) || 1);
    const status = params.get("status") ?? "";
    const q = params.get("q") ?? "";

    const [search, setSearch] = useState(q);
    const [data, setData] = useState<OrdersPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setQuery = useCallback(
        (next: { page?: number; status?: string; q?: string }) => {
            const sp = new URLSearchParams(params.toString());
            for (const [key, value] of Object.entries(next)) {
                if (value === undefined) continue;
                if (value === "" || (key === "page" && value === 1)) sp.delete(key);
                else sp.set(key, String(value));
            }
            const qs = sp.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [params, pathname, router]
    );

    // Поиск с задержкой, чтобы не дёргать сервер на каждую букву; новый поиск — с первой страницы
    useEffect(() => {
        if (search === q) return;
        const timer = setTimeout(() => setQuery({ q: search.trim(), page: 1 }), 350);
        return () => clearTimeout(timer);
    }, [search, q, setQuery]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const sp = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (status) sp.set("status", status);
        if (q) sp.set("q", q);
        try {
            const res = await api<OrdersPage>(`/api/admin/orders?${sp}`);
            setData(res);
            // Страница исчезла (например, заказов стало меньше) — переходим на последнюю
            if (res.items.length === 0 && res.total > 0 && page > res.pages) setQuery({ page: res.pages });
        } catch (err) {
            setError(errorMessage(err, "Could not load orders"));
        } finally {
            setLoading(false);
        }
    }, [page, status, q, setQuery]);

    useEffect(() => {
        load();
    }, [load]);

    const counts = data?.counts;
    const hasAnyOrders = !!counts && counts.all > 0;

    return (
        <>
            <PageHeader title="Orders" description="Online orders paid through Stripe." />

            <Card>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by payment status">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                role="tab"
                                aria-selected={status === f.value}
                                onClick={() => setQuery({ status: f.value, page: 1 })}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    status === f.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {f.label}
                                {counts && (
                                    <span className={`ml-1.5 text-xs ${status === f.value ? "text-white/70" : "text-slate-400"}`}>
                                        {counts[f.countKey]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="relative lg:w-72">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, phone or #"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                            aria-label="Search orders"
                        />
                    </div>
                </div>

                {loading && !data ? (
                    <LoadingState rows={8} />
                ) : error ? (
                    <ErrorState message={error} onRetry={load} />
                ) : !data || data.items.length === 0 ? (
                    hasAnyOrders || q ? (
                        <EmptyState title="Nothing found" description="Try another search or status." />
                    ) : (
                        <EmptyState title="No orders yet" description="Orders appear here after customers check out." />
                    )
                ) : (
                    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
                        <Table>
                            <THead>
                                <TH>Order</TH>
                                <TH>Customer</TH>
                                <TH className="hidden md:table-cell">Type · ready by</TH>
                                <TH>Status</TH>
                                <TH align="right">Total</TH>
                            </THead>
                            <TBody>
                                {data.items.map((order) => {
                                    const c = customerOf(order);
                                    return (
                                        <TR key={order.id} onClick={() => router.push(`/admin/orders/view-orders/${order.id}`)}>
                                            <TD>
                                                <p className="flex items-center gap-2 font-medium text-slate-900">
                                                    #{order.id}
                                                    {order.is_new && <Badge tone="brand">New</Badge>}
                                                </p>
                                                <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                                            </TD>
                                            <TD>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{c.name}</span>
                                                    {order.is_guest && <Badge tone="blue">Guest</Badge>}
                                                </div>
                                                <p className="text-xs text-slate-500">{c.email ?? "No email"}</p>
                                            </TD>
                                            <TD className="hidden md:table-cell">
                                                <p>{orderTypeLabel(orderData(order).orderType)}</p>
                                                {readyLabel(orderData(order)) && (
                                                    <p className={`text-xs ${daysUntilReady(orderData(order)) !== null && daysUntilReady(orderData(order))! <= 1 ? "font-semibold text-amber-700" : "text-slate-500"}`}>
                                                        {readyLabel(orderData(order))}
                                                    </p>
                                                )}
                                            </TD>
                                            <TD><Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge></TD>
                                            <TD align="right" className="font-medium text-slate-900">{formatMoney(order.total)}</TD>
                                        </TR>
                                    );
                                })}
                            </TBody>
                        </Table>
                        <Pagination
                            page={data.page}
                            pages={data.pages}
                            total={data.total}
                            limit={data.limit}
                            onChange={(p) => {
                                setQuery({ page: p });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        />
                    </div>
                )}
            </Card>
        </>
    );
}

// useSearchParams требует Suspense при сборке страницы
const Orders = () => (
    <AdminShell>
        <Suspense fallback={<Card><LoadingState rows={8} /></Card>}>
            <OrdersList />
        </Suspense>
    </AdminShell>
);

export default Orders;
