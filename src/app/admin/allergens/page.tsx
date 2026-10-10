'use client';

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { useList } from "@/lib/useList";

type Allergen = {
    id: number;
    name: string;
};

const Allergens = () => {
    const list = useList<Allergen>("/api/allergens");

    return (
        <AdminShell>
            <PageHeader
                title="Allergens"
                description="Allergens you can mark on products."
                actions={
                    <Button href="/admin/allergens/add-allergens" icon={<PlusIcon className="size-4" />}>
                        Add allergen
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
                        title="No allergens yet"
                        description="Add allergens to show them on product pages."
                        action={<Button href="/admin/allergens/add-allergens" size="sm">Add allergen</Button>}
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
                                    <TD className="font-medium text-slate-900">{item.name}</TD>
                                    <TD align="right">
                                        <RowActions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                href={`/admin/allergens/edit-allergens/${item.id}`}
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
                title="Delete allergen?"
                description={`“${list.pendingDelete?.name}” will be removed from all products.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default Allergens;
