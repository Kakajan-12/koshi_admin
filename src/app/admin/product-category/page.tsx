'use client';

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, Thumb, TR } from "@/Components/ui/Table";
import { uploadUrl } from "@/lib/api";
import { useList } from "@/lib/useList";

type Category = {
    id: number;
    image: string;
    name: string;
};

const Categories = () => {
    const list = useList<Category>("/api/product-category");

    return (
        <AdminShell>
            <PageHeader
                title="Categories"
                description="Menu sections shown on the website."
                actions={
                    <Button href="/admin/product-category/add-product-category" icon={<PlusIcon className="size-4" />}>
                        Add category
                    </Button>
                }
            />

            {list.deleteError && <div className="mb-4"><Alert>{list.deleteError}</Alert></div>}

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
                            <TH>Category</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item) => (
                                <TR key={item.id}>
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
