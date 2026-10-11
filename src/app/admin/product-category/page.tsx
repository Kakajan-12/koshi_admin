'use client';

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, Thumb, TR } from "@/Components/ui/Table";
import { uploadUrl } from "@/lib/api";
import { useList } from "@/lib/useList";
import { api, errorMessage } from "@/lib/http";

type Category = {
    id: number;
    image: string;
    name: string;
};

const Categories = () => {
    const list = useList<Category>("/api/product-category");
    const [savingOrder, setSavingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Сдвиг категории на одну позицию; на сайте категории идут в том же порядке
    const move = async (index: number, delta: -1 | 1) => {
        const target = index + delta;
        if (savingOrder || target < 0 || target >= list.items.length) return;
        const previous = list.items;
        const next = [...previous];
        [next[index], next[target]] = [next[target], next[index]];
        list.setItems(next);
        setSavingOrder(true);
        setOrderError(null);
        try {
            await api("/api/product-category/order", { method: "PUT", json: { ids: next.map((c) => c.id) } });
        } catch (err) {
            list.setItems(previous);
            setOrderError(errorMessage(err, "Could not save the new order"));
        } finally {
            setSavingOrder(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader
                title="Categories"
                description="Menu sections shown on the website, in this order. Use the arrows to change it."
                actions={
                    <Button href="/admin/product-category/add-product-category" icon={<PlusIcon className="size-4" />}>
                        Add category
                    </Button>
                }
            />

            {list.deleteError && <div className="mb-4"><Alert>{list.deleteError}</Alert></div>}
            {orderError && <div className="mb-4"><Alert>{orderError}</Alert></div>}

            <Card>
                {list.loading ? (
                    <LoadingState />
                ) : list.error ? (
                    <ErrorState message={list.error} onRetry={list.reload} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        title="No categories yet"
                        description="Categories group products in the menu."
                        action={<Button href="/admin/product-category/add-product-category" size="sm">Add category</Button>}
                    />
                ) : (
                    <Table>
                        <THead>
                            <TH className="w-24">Order</TH>
                            <TH>Category</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item, index) => (
                                <TR key={item.id}>
                                    <TD>
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 text-sm tabular-nums text-slate-400">{index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => move(index, -1)}
                                                disabled={index === 0 || savingOrder}
                                                aria-label={`Move ${item.name} up`}
                                                title="Move up"
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ArrowUpIcon className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(index, 1)}
                                                disabled={index === list.items.length - 1 || savingOrder}
                                                aria-label={`Move ${item.name} down`}
                                                title="Move down"
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                            >
                                                <ArrowDownIcon className="size-4" />
                                            </button>
                                        </div>
                                    </TD>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <Thumb src={uploadUrl(item.image)} alt={item.name} />
                                            <span className="font-medium text-slate-900">{item.name}</span>
                                        </div>
                                    </TD>
                                    <TD align="right">
                                        <RowActions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                href={`/admin/product-category/edit-product-category/${item.id}`}
                                                icon={<PencilSquareIcon className="size-4" />}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghostDanger"
                                                size="sm"
                                                onClick={() => list.askDelete(item)}
                                                icon={<TrashIcon className="size-4" />}
                                            >
                                                Delete
                                            </Button>
                                        </RowActions>
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <ConfirmDialog
                open={!!list.pendingDelete}
                title="Delete category?"
                description={`“${list.pendingDelete?.name}” will be deleted. Products in it must be moved to another category.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default Categories;
