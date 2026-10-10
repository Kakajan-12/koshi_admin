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
import { formatDate, formatDateTime, formatMoney } from "@/lib/api";
import { api, errorMessage } from "@/lib/http";
import { fullName, initials } from "./userUtils";

const PAGE_SIZE = 20;

type User = {
    id: number;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    address: string;
    isVerified: boolean;
    // false — заблокирован администратором: не может войти
    is_active: boolean;
    has_google: boolean;
    // NULL у тех, кто зарегистрировался до появления даты в базе
    created_at: string | null;
    orders_count: number;
    total_spent: number;
    last_order_at: string | null;
};

type UsersPage = {
    items: User[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    counts: { all: number; verified: number; unverified: number; deactivated: number };
};

const FILTERS = [
    { value: "", label: "All", countKey: "all" },
    { value: "verified", label: "Verified", countKey: "verified" },
    { value: "unverified", label: "Not verified", countKey: "unverified" },
    { value: "deactivated", label: "Deactivated", countKey: "deactivated" },
] as const;

function UsersList() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // Страница, фильтр и поиск живут в адресе — «назад» из карточки возвращает туда же
    const page = Math.max(1, Number(params.get("page")) || 1);
    const verified = params.get("verified") ?? "";
    const q = params.get("q") ?? "";

    const [search, setSearch] = useState(q);
    const [data, setData] = useState<UsersPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setQuery = useCallback(
        (next: { page?: number; verified?: string; q?: string }) => {
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

    // Поиск с задержкой; новый поиск — с первой страницы
    useEffect(() => {
        if (search === q) return;
        const timer = setTimeout(() => setQuery({ q: search.trim(), page: 1 }), 350);
        return () => clearTimeout(timer);
    }, [search, q, setQuery]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const sp = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (verified) sp.set("verified", verified);
        if (q) sp.set("q", q);
        try {
            const res = await api<UsersPage>(`/api/admin/users?${sp}`);
            setData(res);
            if (res.items.length === 0 && res.total > 0 && page > res.pages) setQuery({ page: res.pages });
        } catch (err) {
            setError(errorMessage(err, "Could not load users"));
        } finally {
            setLoading(false);
        }
    }, [page, verified, q, setQuery]);

    useEffect(() => {
        load();
    }, [load]);

    const counts = data?.counts;

    return (
        <>
            <PageHeader title="Users" description="Customers who registered on the website." />

            <Card>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by email verification">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                role="tab"
                                aria-selected={verified === f.value}
                                onClick={() => setQuery({ verified: f.value, page: 1 })}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    verified === f.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {f.label}
                                {counts && (
                                    <span className={`ml-1.5 text-xs ${verified === f.value ? "text-white/70" : "text-slate-400"}`}>
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
                            aria-label="Search users"
                        />
                    </div>
                </div>

                {loading && !data ? (
                    <LoadingState rows={8} />
                ) : error ? (
                    <ErrorState message={error} onRetry={load} />
                ) : !data || data.items.length === 0 ? (
                    (counts && counts.all > 0) || q ? (
                        <EmptyState title="Nothing found" description="Try another search or filter." />
                    ) : (
                        <EmptyState title="No users yet" description="Customers appear here after they register on the website." />
                    )
                ) : (
                    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
                        <Table>
                            <THead>
                                <TH>User</TH>
                                <TH className="hidden md:table-cell">Phone</TH>
                                <TH>Email</TH>
                                <TH className="hidden lg:table-cell">Registered</TH>
                                <TH align="right">Orders</TH>
                                <TH align="right" className="hidden sm:table-cell">Spent</TH>
                            </THead>
                            <TBody>
                                {data.items.map((u) => (
                                    <TR key={u.id} onClick={() => router.push(`/admin/users/${u.id}`)}>
                                        <TD>
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                                    {initials(u)}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">{fullName(u)}</p>
                                                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD className="hidden whitespace-nowrap md:table-cell">{u.phone || "—"}</TD>
                                        <TD>
                                            <div className="flex flex-wrap gap-1">
                                                {!u.is_active && <Badge tone="red">Deactivated</Badge>}
                                                {u.isVerified ? <Badge tone="green">Verified</Badge> : <Badge tone="amber">Not verified</Badge>}
                                            </div>
                                        </TD>
                                        <TD className="hidden whitespace-nowrap lg:table-cell">
                                            {u.created_at ? formatDate(u.created_at) : <span className="text-slate-400">—</span>}
                                        </TD>
                                        <TD align="right">
                                            <p className="font-medium text-slate-900">{u.orders_count}</p>
                                            {u.last_order_at && (
                                                <p className="hidden text-xs text-slate-500 lg:block">last {formatDateTime(u.last_order_at)}</p>
                                            )}
                                        </TD>
                                        <TD align="right" className="hidden font-medium text-slate-900 sm:table-cell">
                                            {formatMoney(u.total_spent)}
                                        </TD>
                                    </TR>
                                ))}
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
const Users = () => (
    <AdminShell>
        <Suspense fallback={<Card><LoadingState rows={8} /></Card>}>
            <UsersList />
        </Suspense>
    </AdminShell>
);

export default Users;
