'use client';

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert, Input, Select } from "@/Components/ui/Form";
import { Badge, ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import Pagination from "@/Components/ui/Pagination";
import { RowActions, Table, TBody, TD, TH, THead, Thumb, TR } from "@/Components/ui/Table";
import { formatMoney, uploadUrl } from "@/lib/api";
import { api, errorMessage } from "@/lib/http";

const PAGE_SIZE = 20;

type Product = {
    id: number;
    main_image: string;
    product_name: string;
    category_name: string | null;
    product_availability: number;
    loved: number;
    variants_count: number;
    min_price: number | null;
    max_price: number | null;
};

type ProductsPage = {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    counts: { all: number; in_stock: number; pre_order: number };
};

type Category = { id: number; name: string };

const FILTERS = [
    { value: "", label: "All", countKey: "all" },
    { value: "in_stock", label: "In stock", countKey: "in_stock" },
    { value: "pre_order", label: "Pre-order", countKey: "pre_order" },
] as const;

const priceRange = (p: Product) => {
    if (p.min_price === null || p.max_price === null) return "—";
    return p.min_price === p.max_price ? formatMoney(p.min_price) : `${formatMoney(p.min_price)} – ${formatMoney(p.max_price)}`;
};

function ProductsList() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    // Страница, вкладка, категория и поиск живут в адресе — «назад» из товара возвращает туда же
    const page = Math.max(1, Number(params.get("page")) || 1);
    const status = params.get("status") ?? "";
    const category = params.get("category") ?? "";
    const q = params.get("q") ?? "";

    const [search, setSearch] = useState(q);
    const [categories, setCategories] = useState<Category[]>([]);
    const [data, setData] = useState<ProductsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const setQuery = useCallback(
        (next: { page?: number; status?: string; category?: string; q?: string }) => {
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
        api<Category[]>("/api/product-category").then(setCategories).catch(() => {});
    }, []);

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
        if (status) sp.set("status", status);
        if (category) sp.set("category", category);
        if (q) sp.set("q", q);
        try {
            const res = await api<ProductsPage>(`/api/admin/products?${sp}`);
            setData(res);
            // Страница опустела (например, после удаления) — переходим на последнюю
            if (res.items.length === 0 && res.total > 0 && page > res.pages) setQuery({ page: res.pages });
        } catch (err) {
            setError(errorMessage(err, "Could not load products"));
        } finally {
            setLoading(false);
        }
    }, [page, status, category, q, setQuery]);

    useEffect(() => {
        load();
    }, [load]);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await api(`/api/product/${pendingDelete.id}`, { method: "DELETE" });
            setPendingDelete(null);
            await load();
        } catch (err) {
            setDeleteError(errorMessage(err, "Could not delete product"));
            setPendingDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    const counts = data?.counts;
    const filtered = !!(q || category);

    return (
        <>
            <PageHeader
                title="Products"
                description={counts ? `${counts.all} ${filtered ? "matching products" : "products in the menu"}` : undefined}
                actions={
                    <Button href="/admin/products/add-product" icon={<PlusIcon className="size-4" />}>
                        Add product
                    </Button>
                }
            />

            {deleteError && <div className="mb-4"><Alert>{deleteError}</Alert></div>}

            <Card>
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by availability">
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
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Select
                            value={category}
                            onChange={(e) => setQuery({ category: e.target.value, page: 1 })}
                            className="sm:w-48"
                            aria-label="Filter by category"
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                        <div className="relative sm:w-64">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search products"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                aria-label="Search products"
                            />
                        </div>
                    </div>
                </div>

                {loading && !data ? (
                    <LoadingState rows={8} />
                ) : error ? (
                    <ErrorState message={error} onRetry={load} />
                ) : !data || data.items.length === 0 ? (
                    (counts && counts.all > 0) || filtered ? (
                        <EmptyState title="Nothing found" description="Try another name, category or filter." />
                    ) : (
                        <EmptyState
                            title="No products yet"
                            description="Add your first cake to the menu."
                            action={<Button href="/admin/products/add-product" size="sm">Add product</Button>}
                        />
                    )
                ) : (
                    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
                        <Table>
                            <THead>
                                <TH>Product</TH>
                                <TH className="hidden md:table-cell">Category</TH>
                                <TH>Price</TH>
                                <TH className="hidden sm:table-cell">Status</TH>
                                <TH align="right"><span className="sr-only">Actions</span></TH>
                            </THead>
                            <TBody>
                                {data.items.map((p) => (
                                    <TR key={p.id} onClick={() => router.push(`/admin/products/view-product/${p.id}`)}>
                                        <TD>
                                            <div className="flex items-center gap-3">
                                                <Thumb src={uploadUrl(p.main_image)} alt={p.product_name} />
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">{p.product_name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {p.variants_count} {p.variants_count === 1 ? "size" : "sizes"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD className="hidden md:table-cell">{p.category_name ?? "—"}</TD>
                                        <TD className="whitespace-nowrap">{priceRange(p)}</TD>
                                        <TD className="hidden sm:table-cell">
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.product_availability ? <Badge tone="green">In stock</Badge> : <Badge tone="amber">Pre-order</Badge>}
                                                {p.loved ? <Badge tone="brand">Favourite</Badge> : null}
                                            </div>
                                        </TD>
                                        <TD align="right">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <RowActions>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        href={`/admin/products/edit-product/${p.id}`}
                                                        icon={<PencilSquareIcon className="size-4" />}
                                                    >
                                                        <span className="hidden lg:inline">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghostDanger"
                                                        size="sm"
                                                        onClick={() => setPendingDelete(p)}
                                                        aria-label={`Delete ${p.product_name}`}
                                                        icon={<TrashIcon className="size-4" />}
                                                    />
                                                </RowActions>
                                            </div>
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

            <ConfirmDialog
                open={!!pendingDelete}
                title="Delete product?"
                description={`“${pendingDelete?.product_name}” will be removed from the menu together with its sizes and gallery photos.`}
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </>
    );
}

// useSearchParams требует Suspense при сборке страницы
const Products = () => (
    <AdminShell>
        <Suspense fallback={<Card><LoadingState rows={8} /></Card>}>
            <ProductsList />
        </Suspense>
    </AdminShell>
);

export default Products;
