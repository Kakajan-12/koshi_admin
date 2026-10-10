'use client';

import Link from "next/link";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { Badge, ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { uploadUrl } from "@/lib/api";
import { useList } from "@/lib/useList";

type Slide = {
    id: number;
    image: string;
    title: string;
    text: string;
    link: string | null;
    link_text: string | null;
};

const Sliders = () => {
    const list = useList<Slide>("/api/sliders");

    return (
        <AdminShell>
            <PageHeader
                title="Hero slides"
                description="The large slideshow at the top of the home page."
                actions={
                    <Button href="/admin/sliders/add-slider" icon={<PlusIcon className="size-4" />}>
                        Add slide
                    </Button>
                }
            />

            {list.deleteError && <div className="mb-4"><Alert>{list.deleteError}</Alert></div>}

            {list.loading ? (
                <Card><LoadingState rows={3} /></Card>
            ) : list.error ? (
                <Card><ErrorState message={list.error} onRetry={list.reload} /></Card>
            ) : list.items.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No slides yet"
                        description="Without slides the home page starts straight from the menu."
                        action={<Button href="/admin/sliders/add-slider" size="sm">Add slide</Button>}
                    />
                </Card>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {list.items.map((slide) => (
                        <Card key={slide.id} className="flex flex-col overflow-hidden">
                            <Link href={`/admin/sliders/view-slider/${slide.id}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={uploadUrl(slide.image)} alt={slide.title} className="size-full object-cover" />
                            </Link>
                            <div className="flex flex-1 flex-col p-4">
                                <Link
                                    href={`/admin/sliders/view-slider/${slide.id}`}
                                    className="line-clamp-1 font-medium text-slate-900 hover:text-brand-600"
                                >
                                    {slide.title}
                                </Link>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{slide.text}</p>
                                <div className="mt-3">
                                    {slide.link ? (
                                        <Badge tone="brand">Button: {slide.link_text || "Learn more"}</Badge>
                                    ) : (
                                        <Badge>No button</Badge>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        href={`/admin/sliders/edit-slider/${slide.id}`}
                                        icon={<PencilSquareIcon className="size-4" />}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghostDanger"
                                        size="sm"
                                        onClick={() => list.askDelete(slide)}
                                        icon={<TrashIcon className="size-4" />}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!list.pendingDelete}
                title="Delete slide?"
                description={`“${list.pendingDelete?.title}” will be removed from the home page.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default Sliders;
