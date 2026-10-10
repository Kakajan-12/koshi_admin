'use client';

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { useList } from "@/lib/useList";

type ProductType = {
    id: number;
    type_name: string;
};

const ProductTypes = () => {
    const list = useList<ProductType>("/api/product-types");

    return (
        <AdminShell>
            <PageHeader
                title="Product types"
                description="Types used to filter products in the menu."
                actions={
                    <Button href="/admin/product-types/add-product-type" icon={<PlusIcon className="size-4" />}>
                        Add type
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
                        title="No product types yet"
                        description="Add types to show them on product pages."
                        action={<Button href="/admin/product-types/add-product-type" size="sm">Add type</Button>}
                    />
                ) : (
                    <Table>
                        <THead>
                            <TH>Name</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item) => (
                                <TR key={item.id}>
                                    <TD className="font-medium text-slate-900">{item.type_name}</TD>
                                    <TD align="right">
                                        <RowActions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                href={`/admin/product-types/edit-product-type/${item.id}`}
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
                title="Delete product type?"
                description={`“${list.pendingDelete?.type_name}” will be deleted. Products of this type must be updated.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default ProductTypes;
