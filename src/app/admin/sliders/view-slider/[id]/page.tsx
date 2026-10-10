'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody, DetailList, DetailRow } from '@/Components/ui/Card';
import { Alert } from '@/Components/ui/Form';
import { ConfirmDialog, ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { uploadUrl } from '@/lib/api';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import { SlidePreview } from '../../SlideForm';

type Slide = { id: number; image: string; title: string; text: string; link: string | null; link_text: string | null };

const ViewSlider = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<Slide>(id ? `/api/sliders/${id}` : null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api(`/api/sliders/${id}`, { method: 'DELETE' });
            router.push('/admin/sliders');
        } catch (err) {
            setDeleteError(errorMessage(err, 'Could not delete slide'));
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader
                title={data?.title ?? 'Slide'}
                back={{ href: '/admin/sliders', label: 'Hero slides' }}
                actions={
                    data && (
                        <>
                            <Button variant="danger" onClick={() => setConfirmOpen(true)} icon={<TrashIcon className="size-4" />}>
                                Delete
                            </Button>
                            <Button href={`/admin/sliders/edit-slider/${id}`} icon={<PencilSquareIcon className="size-4" />}>
                                Edit
                            </Button>
                        </>
                    )
                }
            />

            {deleteError && <div className="mb-4"><Alert>{deleteError}</Alert></div>}

            {loading ? (
                <Card><LoadingState rows={4} /></Card>
            ) : error || !data ? (
                <Card><ErrorState message={error ?? 'Slide not found'} /></Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <SlidePreview
                            title={data.title}
                            text={data.text}
                            link={data.link ?? ''}
                            link_text={data.link_text ?? ''}
                            imageUrl={uploadUrl(data.image)}
                        />
                    </div>
                    <Card className="lg:col-span-2">
                        <CardBody>
                            <DetailList>
                                <DetailRow label="Title">{data.title}</DetailRow>
                                <DetailRow label="Text">{data.text}</DetailRow>
                                <DetailRow label="Button link">
                                    {data.link ? (
                                        <span className="break-all">{data.link}</span>
                                    ) : (
                                        <span className="text-slate-400">No button</span>
                                    )}
                                </DetailRow>
                                <DetailRow label="Button text">
                                    {data.link_text || <span className="text-slate-400">—</span>}
                                </DetailRow>
                            </DetailList>
                        </CardBody>
                    </Card>
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Delete slide?"
                description="The slide will be removed from the home page."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </AdminShell>
    );
};

export default ViewSlider;
