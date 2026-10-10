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
import { Stars } from "@/Components/ui/StarRating";
import { useRouter } from "next/navigation";
import { htmlToText } from "@/lib/html";

type Testimonial = {
    id: number;
    image: string;
    text: string;
    name: string;
    rating: number | null;
};

// Имя и текст приходят из редактора как HTML — в списке показываем обычный текст
const plainText = htmlToText;

const Testimonials = () => {
    const router = useRouter();
    const list = useList<Testimonial>("/api/testimonials");

    return (
        <AdminShell>
            <PageHeader
                title="Testimonials"
                description="Customer reviews on the home page."
                actions={
                    <Button href="/admin/testimonials/add-testimonials" icon={<PlusIcon className="size-4" />}>
                        Add testimonial
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
                        title="No testimonials yet"
                        description="Add what customers say about your cakes."
                        action={<Button href="/admin/testimonials/add-testimonials" size="sm">Add testimonial</Button>}
                    />
                ) : (
                    <Table>
                        <THead>
                            <TH>Customer</TH>
                            <TH className="hidden sm:table-cell">Rating</TH>
                            <TH className="hidden md:table-cell">Testimonial</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item) => (
                                <TR key={item.id} onClick={() => router.push(`/admin/testimonials/view-testimonials/${item.id}`)}>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <Thumb src={uploadUrl(item.image)} alt={item.name} />
                                            <span className="font-medium text-slate-900">{plainText(item.name)}</span>
                                        </div>
                                    </TD>
                                    <TD className="hidden whitespace-nowrap sm:table-cell"><Stars value={item.rating} /></TD>
                                    <TD className="hidden max-w-md md:table-cell">
                                        <p className="line-clamp-2 text-slate-500">{plainText(item.text)}</p>
                                    </TD>
                                    <TD align="right">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <RowActions>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    href={`/admin/testimonials/edit-testimonials/${item.id}`}
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
                                        </div>
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <ConfirmDialog
                open={!!list.pendingDelete}
                title="Delete testimonial?"
                description={`The testimonial from ${plainText(list.pendingDelete?.name ?? "")} will be removed from the website.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default Testimonials;
