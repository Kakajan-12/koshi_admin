'use client';

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { useList } from "@/lib/useList";

type OpenTime = {
    id: number;
    days: string;
    times: string;
};

const OpenTimes = () => {
    const list = useList<OpenTime>("/api/open-time");

    return (
        <AdminShell>
            <PageHeader
                title="Opening hours"
                description="Shown on the About and Contact pages."
                actions={
                    <Button href="/admin/open-time/add-open-time" icon={<PlusIcon className="size-4" />}>
                        Add hours
                    </Button>
                }
            />

            {list.deleteError && <div className="mb-4"><Alert>{list.deleteError}</Alert></div>}

            <Card>
                {list.loading ? (
                    <LoadingState rows={2} />
                ) : list.error ? (
                    <ErrorState message={list.error} onRetry={list.reload} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        title="No opening hours yet"
                        description="Add the days and times the bakery is open."
                        action={<Button href="/admin/open-time/add-open-time" size="sm">Add hours</Button>}
                    />
                ) : (
                    <Table>
                        <THead>
                            <TH>Days</TH>
                            <TH>Hours</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item) => (
                                <TR key={item.id}>
                                    <TD className="font-medium text-slate-900">{item.days}</TD>
                                    <TD>{item.times}</TD>
                                    <TD align="right">
                                        <RowActions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                href={`/admin/open-time/edit-open-time/${item.id}`}
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
                title="Delete opening hours?"
                description={`“${list.pendingDelete?.days}: ${list.pendingDelete?.times}” will be removed from the website.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default OpenTimes;
