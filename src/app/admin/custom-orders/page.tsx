"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, PhotoIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import { Card } from "@/Components/ui/Card";
import { Input } from "@/Components/ui/Form";
import { Badge, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import Pagination from "@/Components/ui/Pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { formatDateTime } from "@/lib/api";
import { api, errorMessage } from "@/lib/http";
import { CustomOrder, daysUntil, formatNeededDate, STATUSES, statusInfo } from "./customOrderUtils";

const PAGE_SIZE = 20;

type CustomOrdersPage = {
    items: CustomOrder[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    counts: Record<"all" | "new" | "in_progress" | "done" | "cancelled", number>;
};

const FILTERS = [{ value: "", label: "All", countKey: "all" as const }, ...STATUSES.map((s) => ({ value: s.value, label: s.label, countKey: s.value }))];

// Подсказка рядом с датой: насколько скоро нужен торт
function DueHint({ order }: { order: CustomOrder }) {
    if (order.status === "done" || order.status === "cancelled") return null;
    const days = daysUntil(order.needed_date);
    if (days < 0) return <Badge tone="red">Date passed</Badge>;
    if (days === 0) return <Badge tone="red">Today</Badge>;
    if (days <= 3) return <Badge tone="amber">In {days} {days === 1 ? "day" : "days"}</Badge>;
    return null;
}

function CustomOrdersList() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // Страница, вкладка и поиск живут в адресе — «назад» из заявки возвращает туда же
    const page = Math.max(1, Number(params.get("page")) || 1);
    const status = params.get("status") ?? "";
    const q = params.get("q") ?? "";

    const [search, setSearch] = useState(q);
    const [data, setData] = useState<CustomOrdersPage | null>(null);
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
            const res = await api<CustomOrdersPage>(`/api/admin/custom-orders?${sp}`);
            setData(res);
            if (res.items.length === 0 && res.total > 0 && page > res.pages) setQuery({ page: res.pages });
        } catch (err) {
            setError(errorMessage(err, "Could not load custom orders"));
        } finally {
            setLoading(false);
        }
    }, [page, status, q, setQuery]);

    useEffect(() => {
        load();
    }, [load]);

    const counts = data?.counts;
    const hasAny = !!counts && counts.all > 0;

    return (
        <>
            <PageHeader title="Custom orders" description="Requests from the custom cake form on the website." />

            <Card>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by status">
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
                            aria-label="Search custom orders"
                        />
                    </div>
                </div>

                {loading && !data ? (
                    <LoadingState rows={8} />
                ) : error ? (
                    <ErrorState message={error} onRetry={load} />
                ) : !data || data.items.length === 0 ? (
                    hasAny || q ? (
                        <EmptyState title="Nothing found" description="Try another search or status." />
                    ) : (
                        <EmptyState title="No custom orders yet" description="Requests from the custom order form appear here." />
                    )
                ) : (
                    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
                        <Table>
                            <THead>
                                <TH>Request</TH>
                                <TH>Customer</TH>
                                <TH>Needed for</TH>
                                <TH className="hidden md:table-cell">Size</TH>
                                <TH>Status</TH>
                            </THead>
                            <TBody>
                                {data.items.map((order) => {
                                    const info = statusInfo(order.status);
                                    return (
                                        <TR key={order.id} onClick={() => router.push(`/admin/custom-orders/${order.id}`)}>
                                            <TD>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-medium text-slate-900">#{order.id}</p>
                                                    {order.has_image && <PhotoIcon className="size-4 text-slate-400" aria-label="Has reference image" />}
                                                </div>
                                                <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
                                            </TD>
                                            <TD>
                                                <p className="font-medium text-slate-900">{order.name}</p>
                                                <p className="text-xs text-slate-500">{order.email}</p>
                                            </TD>
                                            <TD>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-slate-900">{formatNeededDate(order.needed_date)}</span>
                                                    <DueHint order={order} />
                                                </div>
                                                <p className="text-xs text-slate-500">{order.needed_time}</p>
                                            </TD>
                                            <TD className="hidden md:table-cell">{order.size}</TD>
                                            <TD><Badge tone={info.tone}>{info.label}</Badge></TD>
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
const CustomOrders = () => (
    <AdminShell>
        <Suspense fallback={<Card><LoadingState rows={8} /></Card>}>
            <CustomOrdersList />
        </Suspense>
    </AdminShell>
);

export default CustomOrders;
