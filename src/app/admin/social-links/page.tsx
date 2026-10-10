'use client';

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { RowActions, Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import SocialIcon, { platformLabel } from "@/Components/SocialIcon";
import { useList } from "@/lib/useList";

type SocialLink = {
    id: number;
    icon: string;
    url: string;
};

const SocialLinks = () => {
    const list = useList<SocialLink>("/api/links");

    return (
        <AdminShell>
            <PageHeader
                title="Social links"
                description="Icons in the website footer."
                actions={
                    <Button href="/admin/social-links/add-link" icon={<PlusIcon className="size-4" />}>
                        Add link
                    </Button>
                }
            />

            {list.deleteError && <div className="mb-4"><Alert>{list.deleteError}</Alert></div>}

            <Card>
                {list.loading ? (
                    <LoadingState rows={3} />
                ) : list.error ? (
                    <ErrorState message={list.error} onRetry={list.reload} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        title="No social links yet"
                        description="Add links to Instagram, Facebook and other networks."
                        action={<Button href="/admin/social-links/add-link" size="sm">Add link</Button>}
                    />
                ) : (
                    <Table>
                        <THead>
                            <TH>Platform</TH>
                            <TH>Link</TH>
                            <TH align="right"><span className="sr-only">Actions</span></TH>
                        </THead>
                        <TBody>
                            {list.items.map((item) => (
                                <TR key={item.id}>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                <SocialIcon name={item.icon} className="size-4" />
                                            </span>
                                            <span className="font-medium text-slate-900">{platformLabel(item.icon)}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block max-w-xs truncate text-slate-600 hover:text-brand-600 hover:underline"
                                        >
                                            {item.url}
                                        </a>
                                    </TD>
                                    <TD align="right">
                                        <RowActions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                href={`/admin/social-links/edit-link/${item.id}`}
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
                title="Delete social link?"
                description={`The ${platformLabel(list.pendingDelete?.icon ?? "")} icon will disappear from the website footer.`}
                loading={list.deleting}
                onConfirm={list.confirmDelete}
                onCancel={list.cancelDelete}
            />
        </AdminShell>
    );
};

export default SocialLinks;
